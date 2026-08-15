import { useState } from "react";
import KioskHeader from "../components/KioskHeader.jsx";
import "../styles/screens/RequestText.css";

export default function RequestTextScreen({ onSubmit, onBack, isOnline }) {
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
    } catch {
      setError("Something went wrong submitting your request. Please try again or see the front desk.");
      setLoading(false);
    }
  }

  return (
    <div className="kiosk-shell">
      <KioskHeader isOnline={isOnline} />

      <div className="kiosk-content">
        <h1>Tell us what you need</h1>
        <p className="kiosk-subtitle">Briefly describe your request (e.g. medicine name, or the document you need).</p>

        <textarea
          className="request-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type here..."
          rows={4}
          disabled={loading}
          autoFocus
        />

        {error && <p className="manual-entry-error">{error}</p>}
        {loading && <p className="manual-entry-loading">Submitting…</p>}

        <div className="request-text-actions">
          <button className="btn-kiosk btn-kiosk-muted" onClick={onBack} disabled={loading}>
            Back
          </button>
          <button className="btn-kiosk btn-kiosk-primary request-text-continue" onClick={handleContinue} disabled={!canSubmit}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}