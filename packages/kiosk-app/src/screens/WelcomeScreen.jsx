import KioskHeader from "../components/KioskHeader.jsx";
import "../styles/screens/Welcome.css";

// Matches PDF screen: "Welcome to NU Fairview Health Services Office" / TAP YOUR STUDENT ID
export default function WelcomeScreen({ onManualEntry, isOnline }) {
  return (
    <div className="kiosk-shell">
      <KioskHeader isOnline={isOnline} />

      <div className="kiosk-content">
        <h1>Welcome to NU Fairview Health Services Office</h1>
        <p className="kiosk-subtitle">Please check in to access health services</p>

        <div className="welcome-icon-circle">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="2" y="6" width="20" height="13" rx="2.5" />
            <path d="M6 15h4" strokeLinecap="round" />
          </svg>
        </div>

        <h2 className="welcome-tap-label">TAP YOUR STUDENT ID IN THE SCANNER</h2>
        <p className="welcome-tap-hint">Place your physical ID near the reader below the screen</p>

        <button className="btn-kiosk btn-kiosk-primary welcome-manual-btn" onClick={onManualEntry}>
          Don't have your ID? Tap here for Manual Entry
        </button>
      </div>
    </div>
  );
}