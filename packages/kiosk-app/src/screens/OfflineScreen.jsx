import "../offline.css";

// Matches PROJECT-OVERVIEW.pdf: "Offline Fallback Protocol — If Wi-Fi/database
// connection drops, the kiosk gracefully prompts students to proceed directly
// to the manual reception desk."
export default function OfflineScreen() {
  return (
    <div className="offline-screen">
      <div className="offline-icon">⚠</div>
      <h1>We're temporarily unable to check you in here.</h1>
      <p>Please proceed to the front desk and a staff member will assist you.</p>
      <p className="offline-hint">This screen will return to normal automatically once the connection is restored.</p>
    </div>
  );
}