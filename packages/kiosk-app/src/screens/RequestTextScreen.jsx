import { useState } from "react";

// Shown after choosing a sub-type on OtherServicesTypeScreen. Captures the
// student's request as free text before submitting.
//
// ASSUMPTION (flag for review against the actual mockup): this relies on the
// touchscreen's OS-level virtual keyboard popping up on focus, rather than a
// custom on-screen QWERTY keyboard like the numeric keypad built for Manual
// Entry. If the PDF mockup shows a custom keyboard instead, this will need
// to be swapped for one (same pattern as ManualEntryScreen's keypad, just
// with letters).
export default function RequestTextScreen({ onSubmit, onBack }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = text.trim().length > 0 && !loading;

  async function handleContinue() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      await onSubmit(text.trim());
      // On success the parent moves on to the "checked in" step, so this
      // component unmounts — no need to clear loading here.
    } catch {
      setError("Something went wrong submitting your request. Please try again or see the front desk.");
      setLoading(false);
    }
  }

  return (
    <div className="screen request-text-screen">
      <h1>Tell us what you need</h1>
      <p>Briefly describe your request (e.g. medicine name, or the document you need).</p>

      <textarea
        className="request-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type here..."
        rows={4}
        disabled={loading}
        autoFocus
      />

      {error && <p className="error-text">{error}</p>}
      {loading && <p>Submitting…</p>}

      <button onClick={handleContinue} disabled={!canSubmit}>
        Continue
      </button>
      <button onClick={onBack} disabled={loading}>
        Back
      </button>
    </div>
  );
}
