import { useEffect, useState } from "react";
import { getFormPipelines, getSyncLog } from "../services/api.js";

// Matches PDF: "Forms" admin screen — connected Microsoft Forms pipelines
// (MF01, MF02...) and the log of inbound sync attempts (matched / unmatched
// / exception) from the Power Automate webhook.
//
// ASSUMPTION: /api/forms/sync-log does not populate `matchedStudent` or
// `pipeline` (see forms.routes.js — no .populate() call), so this page can
// only show their raw ObjectIds when present, not the student's name or the
// pipeline's title. If that would be more useful, the fix is a one-line
// addition server-side: add
//   .populate("matchedStudent", "firstName lastName studentId").populate("pipeline")
// to the sync-log route's SyncLog.find() call.

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString();
}

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

  if (loading) return <div className="forms-page"><h1>Forms</h1><p>Loading…</p></div>;

  return (
    <div className="forms-page">
      <h1>Forms</h1>
      <p>Microsoft Forms pipelines synced in via Power Automate.</p>

      {error && <p className="error-text">{error}</p>}

      <h2>Pipelines</h2>
      {pipelines.length === 0 ? (
        <p>No pipelines configured yet.</p>
      ) : (
        <table className="emr-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Document</th>
              <th>Target Module</th>
              <th>Status</th>
              <th>Last Synced</th>
            </tr>
          </thead>
          <tbody>
            {pipelines.map((p) => (
              <tr key={p._id} className={p.status === "Error" ? "row-flagged" : undefined}>
                <td>{p.pipelineId}</td>
                <td>{p.documentTitle}</td>
                <td>{p.targetModule}</td>
                <td>{p.status}</td>
                <td>{formatDate(p.lastSyncedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Recent Sync Log</h2>
      {syncLog.length === 0 ? (
        <p>No form submissions synced yet.</p>
      ) : (
        <table className="emr-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Form</th>
              <th>Student ID (as submitted)</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {syncLog.map((s) => (
              <tr key={s._id} className={s.syncResult !== "matched" ? "row-flagged" : undefined}>
                <td>{formatDate(s.createdAt)}</td>
                <td>{s.formName}</td>
                <td>{s.studentIdRaw || "—"}</td>
                <td>{s.syncResult}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
