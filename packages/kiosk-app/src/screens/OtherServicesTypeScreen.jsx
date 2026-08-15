import KioskHeader from "../components/KioskHeader.jsx";
import "../styles/screens/ServiceGrid.css";

// Shown after picking "Medical Clearance" on ServiceSelectScreen.
// Matches PDF spec: Other Services → choose Prescription/OTC vs General Inquiry.
const OPTIONS = [
  { subType: "Prescription/OTC", label: "Prescription & Medicine", desc: "For OTC medicines and prescription requests", icon: "💊" },
  { subType: "General Inquiry", label: "General Inquiry", desc: "For other clinic services and general concerns", icon: "ℹ️" },
];

export default function OtherServicesTypeScreen({ onSelect, onBack, isOnline }) {
  return (
    <div className="kiosk-shell">
      <KioskHeader isOnline={isOnline} />

      <div className="kiosk-content service-grid-content">
        <p className="kiosk-eyebrow">Service: Other Services</p>
        <h1>What would you like to request?</h1>

        <div className="card-grid">
          {OPTIONS.map((o) => (
            <button key={o.subType} className="service-card" onClick={() => onSelect(o.subType)}>
              <div className="service-card-icon">{o.icon}</div>
              <h3>{o.label}</h3>
              <p>{o.desc}</p>
            </button>
          ))}
        </div>

        <button className="service-grid-back-btn" onClick={onBack}>
          ← Back to service selection
        </button>
      </div>
    </div>
  );
}