import { useState } from "react";
import { bulkUpload } from "../services/api.js";

// Matches PDF: Admin > "Upload Master Data" — CSV upload feeding
// POST /students/bulk-upload (bulkUpsertStudents), which expects
// { rows: [{ studentId, firstName, lastName, ... }], mode }.
//
// ASSUMPTION: no CSV parsing library (e.g. papaparse) was present anywhere
// in the code I was given, so this uses a small hand-rolled parser rather
// than assuming a dependency that may not be installed. It handles the
// common case (comma-separated, optional double-quoted fields) but isn't a
// full RFC 4180 implementation — swap in papaparse if your CSVs have edge
// cases like embedded newlines inside quoted fields.
function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };

  function parseLine(line) {
    const cells = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
        else if (ch === '"') { inQuotes = false; }
        else { current += ch; }
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        cells.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    cells.push(current);
    return cells.map((c) => c.trim());
  }

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).filter(Boolean).map((line) => {
    const cells = parseLine(line);
    const row = {};
    headers.forEach((h, i) => { row[h] = cells[i] ?? ""; });
    return row;
  });
  return { headers, rows };
}

// Student.js fields the bulk-upsert route can actually use.
const EXPECTED_COLUMNS = [
  "studentId", "firstName", "lastName", "age", "sex",
  "program", "yearLevel", "guardianContact", "schoolYear",
];

export default function AdminPage() {
  const [fileName, setFileName] = useState(null);
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mode, setMode] = useState("upsert");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const { headers: h, rows: r } = parseCsv(String(reader.result));
      setHeaders(h);
      setRows(r);
    };
    reader.onerror = () => setError("Could not read that file.");
    reader.readAsText(file);
  }

  async function handleSubmit() {
    if (rows.length === 0) return;
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const res = await bulkUpload(rows, mode);
      setResult(res);
    } catch {
      setError("Upload failed. Check that the server is running and the file format is correct.");
    } finally {
      setUploading(false);
    }
  }

  const unexpectedColumns = headers.filter((h) => !EXPECTED_COLUMNS.includes(h));

  return (
    <div className="admin-page">
      <h1>Admin — Upload Master Data</h1>
      <p>
        Upload a CSV of student records. Expected columns: {EXPECTED_COLUMNS.join(", ")}.
        The first row must be a header row.
      </p>

      <input type="file" accept=".csv" onChange={handleFile} />

      {fileName && <p>Selected: <strong>{fileName}</strong> — {rows.length} row(s) found</p>}

      {unexpectedColumns.length > 0 && (
        <p className="error-text">
          Unrecognized column(s) will be ignored: {unexpectedColumns.join(", ")}
        </p>
      )}

      {rows.length > 0 && (
        <>
          <div className="csv-preview-wrap">
            <table className="emr-table csv-preview">
              <thead>
                <tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((r, i) => (
                  <tr key={i}>{headers.map((h) => <td key={h}>{r[h]}</td>)}</tr>
                ))}
              </tbody>
            </table>
            {rows.length > 10 && <p><small>Showing first 10 of {rows.length} rows.</small></p>}
          </div>

          <div className="upload-controls">
            <label>
              Mode:{" "}
              <select value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="upsert">Upsert (update existing, insert new)</option>
                <option value="skip">Skip existing (only insert new)</option>
                <option value="overwrite">Overwrite existing</option>
              </select>
            </label>
            <button onClick={handleSubmit} disabled={uploading}>
              {uploading ? "Uploading…" : `Upload ${rows.length} student(s)`}
            </button>
          </div>
        </>
      )}

      {error && <p className="error-text">{error}</p>}

      {result && (
        <div className="upload-result">
          <h2>Upload complete</h2>
          <p>Inserted: {result.inserted} · Updated: {result.updated} · Skipped: {result.skipped}</p>
          {result.errors?.length > 0 && (
            <>
              <p className="error-text">{result.errors.length} row(s) had errors:</p>
              <ul>
                {result.errors.map((e, i) => (
                  <li key={i}>{e.studentId || "(unknown ID)"}: {e.error}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
