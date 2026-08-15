import { useEffect, useMemo, useState } from "react";
import { getAnalyticsSummary } from "../services/api.js";
import "../styles/pages/Analytics.css";

const RANGE_OPTIONS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

const DONUT_COLORS = ["#0f3f96", "#7b8fd6", "#f6c744", "#4fb0a5", "#d64545", "#8b96a8"];

function formatShortDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

/** Simple dependency-free SVG line chart. `points` = [{label, value}] */
function LineChart({ points, height = 220 }) {
  const width = 640;
  const padding = 36;
  const max = Math.max(1, ...points.map((p) => p.value));

  const coords = points.map((p, i) => {
    const x = points.length > 1 ? padding + (i / (points.length - 1)) * (width - padding * 2) : width / 2;
    const y = height - padding - (p.value / max) * (height - padding * 2);
    return { ...p, x, y };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const areaPath = coords.length
    ? `${linePath} L ${coords[coords.length - 1].x} ${height - padding} L ${coords[0].x} ${height - padding} Z`
    : "";

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="line-chart" preserveAspectRatio="xMidYMid meet">
      {gridLines.map((g) => {
        const y = height - padding - g * (height - padding * 2);
        return (
          <g key={g}>
            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--border)" strokeWidth="1" />
            <text x={4} y={y + 4} fontSize="11" fill="var(--text-muted)">{Math.round(max * g)}</text>
          </g>
        );
      })}

      {coords.length > 0 && <path d={areaPath} fill="var(--nu-blue-light)" opacity="0.6" />}
      {coords.length > 0 && <path d={linePath} fill="none" stroke="var(--nu-blue)" strokeWidth="2.5" />}

      {coords.map((c) => (
        <g key={c.label}>
          <circle cx={c.x} cy={c.y} r="4" fill="var(--nu-blue)" />
          <text x={c.x} y={height - padding + 18} fontSize="11" fill="var(--text-secondary)" textAnchor="middle">
            {formatShortDate(c.label)}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** CSS conic-gradient donut chart. `slices` = [{label, value}] */
function DonutChart({ slices }) {
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1;
  let cursor = 0;
  const stops = slices.map((s, i) => {
    const start = (cursor / total) * 360;
    cursor += s.value;
    const end = (cursor / total) * 360;
    return `${DONUT_COLORS[i % DONUT_COLORS.length]} ${start}deg ${end}deg`;
  });

  return (
    <div className="donut-wrap">
      <div className="donut-chart" style={{ background: `conic-gradient(${stops.join(", ")})` }}>
        <div className="donut-hole">
          <div className="donut-total">{total}</div>
          <div className="donut-total-label">Total</div>
        </div>
      </div>
      <div className="donut-legend">
        {slices.map((s, i) => (
          <div key={s.label} className="donut-legend-item">
            <span className="legend-dot" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
            <span className="legend-label">{s.label}</span>
            <span className="legend-value">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarList({ items, max, suffix = "" }) {
  return (
    <div className="bar-list">
      {items.map((item) => (
        <div className="bar-row" key={item.label}>
          <span className="bar-label">{item.label}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${max > 0 ? Math.round((item.value / max) * 100) : 0}%` }} />
          </div>
          <span className="bar-value">{item.value}{suffix}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAnalyticsSummary(days)
      .then(setData)
      .catch(() => setError("Could not load analytics. Is the server running, and does it have the /api/analytics/summary route?"))
      .finally(() => setLoading(false));
  }, [days]);

  const maxBmiCount = data ? Math.max(1, ...data.bmiDistribution.map((b) => b.count)) : 1;
  const maxQueueCount = data ? Math.max(1, ...data.queueStatusBreakdown.map((q) => q.count)) : 1;

  const feverPoints = useMemo(
    () => (data ? data.feverTrend.map((f) => ({ label: f.date, value: f.totalReadings })) : []),
    [data]
  );

  function exportCsv() {
    if (!data) return;
    const lines = [
      "Section,Label,Value",
      ...data.visitsByServiceType.map((v) => `Visits by Service,${v.serviceType},${v.count}`),
      ...data.bmiDistribution.map((b) => `BMI Distribution,${b.category},${b.count}`),
      ...data.queueStatusBreakdown.map((q) => `Queue Status,${q.status},${q.count}`),
      ...data.feverTrend.map((f) => `Fever Trend,${f.date},${f.totalReadings} (${f.feverCount} fever)`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hso-analytics-${days}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="page-header">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 20V10M12 20V4M20 20v-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h1>Data Analytics</h1>
      </div>

      <div className="analytics-toolbar">
        <div className="analytics-range">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.days}
              className={"range-pill" + (days === opt.days ? " active" : "")}
              onClick={() => setDays(opt.days)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button className="btn btn-outline" onClick={exportCsv} disabled={!data}>Export CSV</button>
      </div>

      {error && <p className="error-text">{error}</p>}
      {loading && <p className="page-subtitle">Loading…</p>}

      {!loading && data && (
        <>
          <div className="stat-cards">
            <div className="stat-card">
              <div className="stat-label">🧑‍🎓 Students Screened</div>
              <div className="stat-value">{data.totalStudentsScreened}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">📋 Total Visits</div>
              <div className="stat-value">{data.visitsByServiceType.reduce((sum, v) => sum + v.count, 0)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">🌡️ Fever Flags</div>
              <div className="stat-value">{data.feverTrend.reduce((sum, f) => sum + f.feverCount, 0)}</div>
            </div>
          </div>

          <div className="analytics-grid">
            <div className="card">
              <h2>Fever Readings Trend</h2>
              {feverPoints.length === 0 ? (
                <div className="table-empty">No vitals recorded in this range.</div>
              ) : (
                <LineChart points={feverPoints} />
              )}
            </div>

            <div className="card">
              <h2>Visits by Service Type</h2>
              {data.visitsByServiceType.length === 0 ? (
                <div className="table-empty">No visits in this range.</div>
              ) : (
                <DonutChart slices={data.visitsByServiceType.map((v) => ({ label: v.serviceType, value: v.count }))} />
              )}
            </div>
          </div>

          <div className="analytics-grid">
            <div className="card">
              <h2>BMI Distribution</h2>
              {data.bmiDistribution.length === 0 ? (
                <div className="table-empty">No BMI data in this range.</div>
              ) : (
                <BarList items={data.bmiDistribution.map((b) => ({ label: b.category, value: b.count }))} max={maxBmiCount} />
              )}
            </div>

            <div className="card">
              <h2>Queue Status Breakdown</h2>
              {data.queueStatusBreakdown.length === 0 ? (
                <div className="table-empty">No queue entries in this range.</div>
              ) : (
                <BarList items={data.queueStatusBreakdown.map((q) => ({ label: q.status, value: q.count }))} max={maxQueueCount} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}