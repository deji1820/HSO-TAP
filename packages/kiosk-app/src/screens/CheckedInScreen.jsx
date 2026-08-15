import KioskHeader from "../components/KioskHeader.jsx";
import "../styles/screens/CheckedIn.css";

export default function CheckedInScreen({ info, onDone, isOnline }) {
  return (
    <div className="kiosk-shell">
      <KioskHeader isOnline={isOnline} />

      <div className="kiosk-content">
        <div className="checkin-success-icon">✓</div>
        <h1>You're checked in</h1>
        <p className="kiosk-subtitle">Please have a seat — a staff member will call you shortly.</p>

        <div className="kiosk-card checkin-summary">
          {info?.serviceType && (
            <div className="checkin-row">
              <span className="confirm-detail-label">Service:</span>
              <span className="confirm-detail-value">
                {info.serviceType}
                {info?.subType ? ` — ${info.subType}` : ""}
              </span>
            </div>
          )}
          {info?.queueNumber && (
            <div className="checkin-queue-block">
              <span className="checkin-queue-label">Queue Number</span>
              <span className="checkin-queue-number">{info.queueNumber}</span>
            </div>
          )}
        </div>

        <button className="btn-kiosk btn-kiosk-primary checkin-done-btn" onClick={onDone}>
          Done
        </button>
      </div>
    </div>
  );
}