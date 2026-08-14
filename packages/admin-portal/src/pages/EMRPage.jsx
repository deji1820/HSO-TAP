import { useState } from "react";
import { getStudents, getFullEmr } from "../services/api.js";

// Matches PDF: EMR screen — student search/list on the left, full record
// (Vitals, Consultation History, External Documents tabs) on the right.
// Single-page master/detail layout, same pattern as DashboardPage (no
// nested routing) so a student can be looked up and viewed in one flow.

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString();
}

function VitalsTab({ vitals }) {
  if (!vitals?.length) return <p>No vitals recorded yet.</p>;
  return (
    <table className="emr-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Temp (°C)</th>
          <th>Height (cm)</th>
          <th>Weight (kg)</th>
          <th>BMI</th>
          <th>Category</th>
          <th>Source</th>
        </tr>
      </thead>
      <tbody>
        {vitals.map((v) => (
          <tr key={v._id} className={v.isFeverFlagged ? "row-flagged" : undefined}>
            <td>{formatDate(v.capturedAt)}</td>
            <td>{v.temperatureC ?? "—"}{v.isFeverFlagged ? " ⚠" : ""}</td>
            <td>{v.heightCm ?? "—"}</td>
            <td>{v.weightKg ?? "—"}</td>
            <td>{v.bmi ?? "—"}</td>
            <td>{v.bmiCategory ?? "—"}</td>
            <td>{v.source}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ConsultationsTab({ consultations }) {
  if (!consultations?.length) return <p>No consultation records yet.</p>;
  return (
    <div className="consultation-list">
      {consultations.map((c) => (
        <div key={c._id} className="consultation-card">
          <h4>{c.visitType} — {formatDate(c.visitDate)}</h4>
          {c.visitType === "General Inquiry" ? (
            <>
              {c.natureOfInquiry && <p><strong>Inquiry:</strong> {c.natureOfInquiry}</p>}
              {c.inquiryResponse && <p><strong>Response:</strong> {c.inquiryResponse}</p>}
            </>
          ) : (
            <>
              {c.subjective && <p><strong>S:</strong> {c.subjective}</p>}
              {c.objective && <p><strong>O:</strong> {c.objective}</p>}
              {c.assessment && <p><strong>A:</strong> {c.assessment}</p>}
              {c.plan && <p><strong>P:</strong> {c.plan}</p>}
              {c.otc?.itemDispensed && (
                <p><strong>Dispensed:</strong> {c.otc.itemDispensed} ({c.otc.quantity}) — {c.otc.instructions}</p>
              )}
              {c.sessionNotes && <p><strong>Notes:</strong> {c.sessionNotes}</p>}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function DocumentsTab({ documents }) {
  if (!documents?.length) return <p>No external documents synced yet.</p>;
  return (
    <table className="emr-table">
      <thead>
        <tr>
          <th>Document</th>
          <th>Source</th>
          <th>Status</th>
          <th>Submitted</th>
          <th>File</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((d) => (
          <tr key={d._id}>
            <td>{d.documentTitle}</td>
            <td>{d.formSource}</td>
            <td>{d.status}</td>
            <td>{formatDate(d.submittedAt)}</td>
            <td>{d.fileUrl ? <a href={d.fileUrl} target="_blank" rel="noreferrer">View</a> : "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function EMRPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [record, setRecord] = useState(null); // { student, vitals, consultations, documents }
  const [loadingRecord, setLoadingRecord] = useState(false);
  const [tab, setTab] = useState("vitals");
  const [error, setError] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    setSearching(true);
    setError(null);
    try {
      const students = await getStudents(query);
      setResults(students);
    } catch {
      setError("Could not search students. Is the server running?");
    } finally {
      setSearching(false);
    }
  }

  async function openStudent(id) {
    setLoadingRecord(true);
    setError(null);
    setTab("vitals");
    try {
      const full = await getFullEmr(id);
      setRecord(full);
    } catch {
      setError("Could not load this student's record.");
    } finally {
      setLoadingRecord(false);
    }
  }

  return (
    <div className="emr-page">
      <h1>Electronic Medical Records</h1>

      <form onSubmit={handleSearch} className="emr-search">
        <input
          type="text"
          placeholder="Search by Student ID, first or last name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" disabled={searching}>{searching ? "Searching…" : "Search"}</button>
      </form>

      {error && <p className="error-text">{error}</p>}

      <div className="emr-layout">
        <div className="emr-results">
          {results.length === 0 && !searching && <p>Search for a student to view their record.</p>}
          <ul className="emr-results-list">
            {results.map((s) => (
              <li key={s._id}>
                <button className="emr-result-item" onClick={() => openStudent(s._id)}>
                  {s.lastName}, {s.firstName} — {s.studentId}
                  <br />
                  <small>{s.program} {s.yearLevel}</small>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="emr-detail">
          {loadingRecord && <p>Loading record…</p>}

          {!loadingRecord && record && (
            <>
              <div className="emr-header">
                <h2>{record.student.firstName} {record.student.lastName}</h2>
                <p>
                  {record.student.studentId} · {record.student.program} · {record.student.yearLevel}
                  {record.student.sex ? ` · ${record.student.sex}` : ""}
                  {record.student.age ? ` · Age ${record.student.age}` : ""}
                </p>
                {record.student.healthFlags?.length > 0 && (
                  <p className="health-flags">
                    ⚠ {record.student.healthFlags.join(", ")}
                  </p>
                )}
                {record.student.guardianContact && (
                  <p><small>Guardian contact: {record.student.guardianContact}</small></p>
                )}
              </div>

              <div className="emr-tabs">
                <button className={tab === "vitals" ? "active" : ""} onClick={() => setTab("vitals")}>
                  Vitals ({record.vitals.length})
                </button>
                <button className={tab === "consultations" ? "active" : ""} onClick={() => setTab("consultations")}>
                  Consultation History ({record.consultations.length})
                </button>
                <button className={tab === "documents" ? "active" : ""} onClick={() => setTab("documents")}>
                  External Documents ({record.documents.length})
                </button>
              </div>

              <div className="emr-tab-content">
                {tab === "vitals" && <VitalsTab vitals={record.vitals} />}
                {tab === "consultations" && <ConsultationsTab consultations={record.consultations} />}
                {tab === "documents" && <DocumentsTab documents={record.documents} />}
              </div>
            </>
          )}

          {!loadingRecord && !record && <p>No student selected.</p>}
        </div>
      </div>
    </div>
  );
}
