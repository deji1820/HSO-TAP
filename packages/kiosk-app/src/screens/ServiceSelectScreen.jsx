import KioskHeader from "../components/KioskHeader.jsx";
import "../styles/screens/ServiceGrid.css";

// Matches PDF: "What is the purpose of your visit?" (Step 2 of 2)
// NOTE: labels here must exactly match the QueueEntry.serviceType enum
// in packages/server/src/models/QueueEntry.js
const SERVICES = [
  { label: "Quick Health Screening", desc: "Self-Service Body Temperature, Height, Weight & BMI Calculation", icon: "🩺" },
  { label: "Medical Consultation", desc: "Medical consultation & Dental consultation", icon: "⚕️" },
  { label: "Medical Clearance", desc: "Medical clearance, prescription & medicine", icon: "📋" },
];

export default function ServiceSelectScreen({ onSelect, onCancel, isOnline }) {
  return (
    <div className="kiosk-shell">
      <KioskHeader isOnline={isOnline} />

      <div className="kiosk-content service-grid-content">
        <p className="kiosk-eyebrow">Step 2 of 2: Service Selection</p>
        <h1>What is the purpose of your visit?</h1>

        <div className="card-grid">
          {SERVICES.map((s) => (
            <button key={s.label} className="service-card" onClick={() => onSelect(s.label)}>
              <div className="service-card-icon">{s.icon}</div>
              <h3>{s.label}</h3>
              <p>{s.desc}</p>
            </button>
          ))}
        </div>

        <button className="service-grid-back-btn" onClick={onCancel}>
          Cancel / Exit
        </button>
      </div>
    </div>
  );
}