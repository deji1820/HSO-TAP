import { useState } from "react";
import { getStudents, getFullEmr } from "../services/api.js";
import "../styles/components/ActiveSessionModal.css";
import "../styles/pages/EMR.css";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function VitalsTab({ vitals }) {
  if (!vitals?.length) return <div className="table-empty">No vitals recorded yet.</div>;
  return (
    <div className="table-wrap">
      <table className="data-table">
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
            <tr key={v._id}>
              <td>{formatDate(v.capturedAt)}</td>
              <td>
                {v.temperatureC ?? "—"}
                {v.isFeverFlagged && <span className="badge badge-high" style={{ marginLeft: 6 }}>Fever</span>}
              </td>
              <td>{v.heightCm ?? "—"}</td>
              <td>{v.weightKg ?? "—"}</td>
              <td>{v.bmi ?? "—"}</td>
              <td>{v.bmiCategory ?? "—"}</td>
              <td>{v.source === "kiosk" ? "Kiosk Intake" : "Staff Entry"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// One row of the Consultation History accordion.
function ConsultationEntry({ c, expanded, onToggle }) {
  const v = c.vitalsSnapshot || {};
  const hasKioskVitals = v.temperatureC != null || v.heightCm != null || v.weightKg != null;
  const hasSecondaryVitals = v.bloodPressure || v.pulseRate != null || v.spo2 != null;

  return (
    <div className="consultation-entry">
      <button className="consultation-entry-header" onClick={onToggle}>
        <span className={"consultation-caret" + (expanded ? " open" : "")}>▶</span>
        <span className="consultation-entry-date">Visit Date: {formatDate(c.visitDate)}</span>
        <span className="consultation-entry-type">Type: {c.visitType}</span>
        <span className="consultation-entry-staff">Attending: {c.attendingStaff?.name || "—"}</span>
      </button>

      {expanded && (
        <ul className="consultation-entry-body">
          {hasKioskVitals && (
            <li>
              Kiosk Intake Vitals: Temp: {v.temperatureC ?? "—"}°C
              {v.isFeverFlagged ? " (Fever Flagged)" : ""} | Height: {v.heightCm ?? "—"} cm | Weight: {v.weightKg ?? "—"} kg | BMI: {v.bmi ?? "—"} {v.bmiCategory ? `(${v.bmiCategory})` : ""}
            </li>
          )}
          {hasSecondaryVitals && (
            <li>
              Secondary Vitals: BP: {v.bloodPressure || "None"} | Pulse Rate: {v.pulseRate ?? "None"} | SpO2: {v.spo2 ?? "None"}
            </li>
          )}

          {c.visitType === "General Inquiry" ? (
            <>
              {c.natureOfInquiry && <li>Inquiry: {c.natureOfInquiry}</li>}
              {c.inquiryResponse && <li>Response: {c.inquiryResponse}</li>}
            </>
          ) : c.visitType === "Medication and Relief" ? (
            <>
              {c.otc?.itemDispensed && (
                <li>Dispensed: {c.otc.itemDispensed} ({c.otc.quantity}) — {c.otc.instructions}</li>
              )}
              {c.firstAid?.careProvided && (
                <li>First Aid: {c.firstAid.careProvided} — applied to {c.firstAid.appliedTo}, rest: {c.firstAid.restRequired}</li>
              )}
              {c.sessionNotes && <li>Notes: {c.sessionNotes}</li>}
            </>
          ) : (
            <>
              {c.subjective && <li>Subjective (S): {c.subjective}</li>}
              {c.objective && <li>Objective (O): {c.objective}</li>}
              {c.assessment && <li>Assessment (A): {c.assessment}</li>}
              {c.plan && <li>Plan &amp; Management (P): {c.plan}</li>}
            </>
          )}
        </ul>
      )}
    </div>
  );
}

function ConsultationsTab({ consultations }) {
  // Newest visit starts expanded; everything else starts collapsed.
  const [openId, setOpenId] = useState(consultations?.[0]?._id ?? null);

  if (!consultations?.length) return <div className="table-empty">No consultation records yet.</div>;
  return (
    <div className="consultation-list card">
      {consultations.map((c) => (
        <ConsultationEntry
          key={c._id}
          c={c}
          expanded={openId === c._id}
          onToggle={() => setOpenId((id) => (id === c._id ? null : c._id))}
        />
      ))}
    </div>
  );
}

function DocumentsTab({ documents }) {
  if (!documents?.length) return <div className="table-empty">No external documents synced yet.</div>;
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Document Title</th>
            <th>Form Source</th>
            <th>Date Submitted</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((d) => (
            <tr key={d._id}>
              <td>{d.documentTitle}</td>
              <td>{d.formSource}</td>
              <td>{formatDate(d.submittedAt)}</td>
              <td>
                <span className={"badge " + (d.status === "Verified" ? "badge-routine" : d.status === "Rejected" ? "badge-high" : "badge-standard")}>
                  {d.status}
                </span>
              </td>
              <td>{d.fileUrl ? <a href={d.fileUrl} target="_blank" rel="noreferrer">View</a> : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TABS = [
  { key: "consultations", label: "Consultation History", icon: "📄" },
  { key: "vitals", label: "Vitals and Physical Metrics", icon: "🩺" },
  { key: "documents", label: "External Documents", icon: "📁" },
];

export default function EMRPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [record, setRecord] = useState(null);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const [tab, setTab] = useState("consultations");
  const [error, setError] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    setSearching(true);
    setSearched(true);
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
    setTab("consultations");
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
    <div>
      <div className="page-header">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6Z" strokeLinejoin="round" />
        </svg>
        <h1>Electronic Medical Records</h1>
      </div>

      <form onSubmit={handleSearch} className="emr-search card">
        <input
          className="text-input"
          type="text"
          placeholder="Search by Student ID, first or last name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-primary" type="submit" disabled={searching}>
          {searching ? "Searching…" : "Search"}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      <div className="table-wrap emr-results-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Full Name</th>
              <th>Program</th>
              <th>Year Level</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {results.map((s) => (
              <tr key={s._id}>
                <td>{s.studentId}</td>
                <td>{s.lastName}, {s.firstName}</td>
                <td>{s.program || "—"}</td>
                <td>{s.yearLevel || "—"}</td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => openStudent(s._id)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {results.length === 0 && (
          <div className="table-empty">
            {searched ? "No students match that search." : "Search for a student to view their record."}
          </div>
        )}
      </div>

      {loadingRecord && <p className="page-subtitle" style={{ marginTop: 18 }}>Loading record…</p>}

      {!loadingRecord && record && (
        <div className="emr-detail-card">
          <div className="emr-detail-bar">
            <span>Student &gt; {record.student.studentId}</span>
            <button className="active-session-close" onClick={() => setRecord(null)} aria-label="Close">✕</button>
          </div>

          <div className="card patient-info-block">
            <div className="patient-info-grid">
              <div><span className="field-label-inline">Name:</span> {record.student.lastName}, {record.student.firstName}</div>
              <div><span className="field-label-inline">Student ID:</span> {record.student.studentId}</div>
              <div><span className="field-label-inline">Program:</span> {record.student.program || "—"}</div>
              <div><span className="field-label-inline">Age:</span> {record.student.age ?? "—"}</div>
              <div><span className="field-label-inline">Sex:</span> {record.student.sex || "—"}</div>
              <div><span className="field-label-inline">Guardian's Contact:</span> {record.student.guardianContact || "—"}</div>
            </div>
            <div className="health-flags-row">
              <span className="field-label-inline">Health Flags:</span>
              {record.student.healthFlags?.length > 0 ? (
                record.student.healthFlags.map((f) => <span key={f} className="badge badge-high">{f}</span>)
              ) : (
                <span className="health-flags-empty" />
              )}
            </div>
          </div>

          <div className="workstation-tabs emr-segmented-tabs">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={"workstation-tab" + (tab === t.key ? " active" : "")}
                onClick={() => setTab(t.key)}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="emr-tab-content">
            {tab === "consultations" && <ConsultationsTab consultations={record.consultations} />}
            {tab === "vitals" && <VitalsTab vitals={record.vitals} />}
            {tab === "documents" && <DocumentsTab documents={record.documents} />}
          </div>
        </div>
      )}
    </div>
  );
}