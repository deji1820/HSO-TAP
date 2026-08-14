import { useState } from "react";

// Matches PDF screen: "Manual Entry" — numeric keypad for students without
// (or whose) RFID card doesn't read.
//
// ASSUMPTION (flag for review against the actual mockup): student IDs follow
// the "YYYY-NNNNNN" pattern seen in scripts/seedStudent.js (e.g.
// "2024-100123") — 4-digit year, dash, 6-digit sequence, 10 digits total.
// The dash is inserted automatically as the student types; Continue is
// disabled until all 10 digits are entered. If the real format differs,
// adjust MAX_DIGITS / formatId below.
const MAX_DIGITS = 10;
const DASH_AFTER = 4;

function formatId(digits) {
  if (digits.length <= DASH_AFTER) return digits;
  return `${digits.slice(0, DASH_AFTER)}-${digits.slice(DASH_AFTER)}`;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"];

export default function ManualEntryScreen({ onSubmit, onCancel }) {
  const [digits, setDigits] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = digits.length === MAX_DIGITS && !loading;

  function pressKey(key) {
    if (loading) return;
    setError(null);
    if (key === "back") {
      setDigits((d) => d.slice(0, -1));
    } else if (key === "clear") {
      setDigits("");
    } else if (digits.length < MAX_DIGITS) {
      setDigits((d) => d + key);
    }
  }

  async function handleContinue() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      await onSubmit(formatId(digits));
      // On success the parent switches `step` away from "manual", so this
      // component unmounts — no need to clear loading here.
    } catch {
      setError("Student ID not found. Please check the number and try again, or ask the front desk for help.");
      setLoading(false);
    }
  }

  return (
    <div className="screen manual-entry-screen">
      <h1>Manual Entry</h1>
      <p>Enter your Student ID number</p>

      <div className="id-display">{formatId(digits) || "—"}</div>

      {error && <p className="error-text">{error}</p>}
      {loading && <p>Looking up student…</p>}

      <div className="keypad">
        {KEYS.map((key) => (
          <button
            key={key}
            className="keypad-key"
            onClick={() => pressKey(key)}
            disabled={loading}
          >
            {key === "back" ? "⌫" : key === "clear" ? "Clear" : key}
          </button>
        ))}
      </div>

      <button onClick={handleContinue} disabled={!canSubmit}>
        Continue
      </button>
      <button onClick={onCancel} disabled={loading}>
        Back
      </button>
    </div>
  );
}
