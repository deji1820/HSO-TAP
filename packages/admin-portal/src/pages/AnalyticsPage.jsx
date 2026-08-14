import { useEffect, useState } from "react";
import { getAnalyticsSummary } from "../services/api.js";

// Matches PDF: "Data Analytics" screen — trends on illness/fever rates and
// visit volume by service type. Backed by GET /api/analytics/summary
// (new endpoint — see analytics.controller.js), which aggregates
// VitalsLog + QueueEntry over a rolling window.
//
// No charting library (recharts, chart.js, etc.) appears anywhere in the
// code I was given, so this renders simple CSS bar visualizations instead
// of assuming a dependency that may not be installed. Swap for a real
// charting library if you add one later — the data shape is already
// chart-ready (array of {label, value} per section).

function BarRow({ label, value, max, suffix = "" }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="bar-value">{value}{suffix}</span>
    </div>
  );
}

const RANGE_OPTIONS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

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

  const maxServiceCount = data ? Math.max(1, ...data.visitsByServiceType.map((v) => v.count)) : 1;
  const maxBmiCount = data ? Math.max(1, ...data.bmiDistribution.map((b) => b.count)) : 1;
  const maxQueueCount = data ? Math.max(1, ...data.queueStatusBreakdown.map((q) => q.count)) : 1;
  const maxFeverReadings = data ? Math.max(1, ...data.feverTrend.map((f) => f.totalReadings)) : 1;

  return (
    <div className="analytics-page">
      <h1>Data Analytics</h1>

      <div className="analytics-range">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.days}
            className={days === opt.days ? "active" : ""}
            onClick={() => setDays(opt.days)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {error && <p className="error-text">{error}</p>}
      {loading && <p>Loading…</p>}

      {!loading && data && (
        <>
          <div className="analytics-stat-cards">
            <div className="stat-card">
              <h3>{data.totalStudentsScreened}</h3>
              <p>Students screened</p>
            </div>
            <div className="stat-card">
              <h3>{data.visitsByServiceType.reduce((sum, v) => sum + v.count, 0)}</h3>
              <p>Total visits</p>
            </div>
            <div className="stat-card">
              <h3>{data.feverTrend.reduce((sum, f) => sum + f.feverCount, 0)}</h3>
              <p>Fever flags</p>
            </div>
          </div>

          <section>
            <h2>Visits by Service Type</h2>
            {data.visitsByServiceType.length === 0 ? (
              <p>No visits in this range.</p>
            ) : (
              data.visitsByServiceType.map((v) => (
                <BarRow key={v.serviceType} label={v.serviceType} value={v.count} max={maxServiceCount} />
              ))
            )}
          </section>

          <section>
            <h2>Fever Rate Trend</h2>
            {data.feverTrend.length === 0 ? (
              <p>No vitals recorded in this range.</p>
            ) : (
              <table className="emr-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Readings</th>
                    <th>Fever-flagged</th>
                    <th>Fever rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.feverTrend.map((f) => (
                    <tr key={f.date} className={f.feverRatePct > 0 ? "row-flagged" : undefined}>
                      <td>{f.date}</td>
                      <td>{f.totalReadings}</td>
                      <td>{f.feverCount}</td>
                      <td>{f.feverRatePct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section>
            <h2>BMI Distribution</h2>
            {data.bmiDistribution.length === 0 ? (
              <p>No BMI data in this range.</p>
            ) : (
              data.bmiDistribution.map((b) => (
                <BarRow key={b.category} label={b.category} value={b.count} max={maxBmiCount} />
              ))
            )}
          </section>

          <section>
            <h2>Queue Status Breakdown</h2>
            {data.queueStatusBreakdown.length === 0 ? (
              <p>No queue entries in this range.</p>
            ) : (
              data.queueStatusBreakdown.map((q) => (
                <BarRow key={q.status} label={q.status} value={q.count} max={maxQueueCount} />
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}