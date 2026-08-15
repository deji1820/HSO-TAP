import { useEffect, useState } from "react";
import { getFormPipelines, getSyncLog } from "../services/api.js";
import "../styles/pages/Forms.css";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function isToday(d) {
  if (!d) return false;
  const date = new Date(d);
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

const STATUS_BADGE = {
  Active: "badge-active",
  Error: "badge-high",
  Paused: "badge-standard",
};

const RESULT_BADGE = {
  matched: "badge-routine",
};

export default function FormsPage() {
  const [pipelines, setPipelines] = useState([]);
  const [syncLog, setSyncLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getFormPipelines(), getSyncLog()])
      .then(([p, s]) => {
        setPipelines(p);
        setSyncLog(s);
      })
      .catch(() => setError("Could not load form pipelines. Is the server running?"))
      .finally(() => setLoading(false));
  }, []);

  const activeCount = pipelines.filter((p) => p.status === "Active").length;
  const submissionsToday = syncLog.filter((s) => isToday(s.createdAt)).length;
  const unmatchedCount = syncLog.filter((s) => s.syncResult !== "matched").length;

  return (
    <div>
      <div className="page-header">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 3h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
          <path d="M14 3v5h5" strokeLinejoin="round" />
        </svg>
        <h1>Forms</h1>
      </div>

      {error && <p className="error-text">{error}</p>}
      {loading && <p className="page-subtitle">Loading…</p>}

      {!loading && (
        <>
          <div className="stat-cards">
            <div className="stat-card">
              <div className="stat-label">🔗 Active Form Pipelines</div>
              <div className="stat-value">{activeCount} <span className="stat-suffix">Operational</span></div>
            </div>
            <div className="stat-card">
              <div className="stat-label">📥 Submissions Today</div>
              <div className="stat-value">{submissionsToday}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">⚠️ Unmatched / Exception</div>
              <div className="stat-value">{unmatchedCount}</div>
            </div>
          </div>

          <h2 className="section-title">🔗 Connected Microsoft Forms Pipelines</h2>
          <div className="table-wrap" style={{ marginBottom: 24 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Document Title</th>
                  <th>Target Module</th>
                  <th>Last Synced</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pipelines.map((p) => (
                  <tr key={p._id}>
                    <td>{p.pipelineId}</td>
                    <td>{p.documentTitle}</td>
                    <td>{p.targetModule}</td>
                    <td>{formatDate(p.lastSyncedAt)}</td>
                    <td>
                      <span className={"badge " + (STATUS_BADGE[p.status] || "badge-standard")}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pipelines.length === 0 && <div className="table-empty">No pipelines configured yet.</div>}
          </div>

          <h2 className="section-title">📥 Recent Incoming Submissions &amp; Sync Log</h2>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Form Name</th>
                  <th>Student ID (as submitted)</th>
                  <th>Sync Result</th>
                </tr>
              </thead>
              <tbody>
                {syncLog.map((s) => (
                  <tr key={s._id}>
                    <td>{formatDate(s.createdAt)}</td>
                    <td>{s.formName}</td>
                    <td>{s.studentIdRaw || "—"}</td>
                    <td>
                      <span className={"badge " + (RESULT_BADGE[s.syncResult] || "badge-high")}>{s.syncResult}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {syncLog.length === 0 && <div className="table-empty">No form submissions synced yet.</div>}
          </div>
        </>
      )}
    </div>
  );
}