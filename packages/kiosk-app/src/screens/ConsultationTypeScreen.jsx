import KioskHeader from "../components/KioskHeader.jsx";
import "../styles/screens/ServiceGrid.css";

// Shown after picking "Medical Consultation" on ServiceSelectScreen.
// Matches PDF spec: Clinic Consultation → choose Medical vs Dental.
const OPTIONS = [
  { subType: "Medical", label: "Medical consultation", desc: "For general health check-ups and medical conditions", icon: "👨‍⚕️" },
  { subType: "Dental", label: "Dental consultation", desc: "For oral check-ups and dental concerns.", icon: "🦷" },
];

export default function ConsultationTypeScreen({ onSelect, onBack, isOnline }) {
  return (
    <div className="kiosk-shell">
      <KioskHeader isOnline={isOnline} />

      <div className="kiosk-content service-grid-content">
        <p className="kiosk-eyebrow">Service: Clinic Consultation</p>
        <h1>What would you like to consult?</h1>

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