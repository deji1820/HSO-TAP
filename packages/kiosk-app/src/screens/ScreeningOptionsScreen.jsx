import KioskHeader from "../components/KioskHeader.jsx";
import "../styles/screens/ServiceGrid.css";

// Matches PDF: "What would you like to check?" (Service: Quick Health Screening)
const OPTIONS = [
  { mode: "complete", label: "Complete Check", desc: "Body Temperature, Height, Weight & BMI Calculation", icon: "🩺" },
  { mode: "temperature", label: "Body Temperature", desc: "Quick thermal scan using the sensor", icon: "🌡️" },
  { mode: "physical", label: "Physical Metrics", desc: "Height, Weight & BMI Calculation", icon: "📏" },
];

export default function ScreeningOptionsScreen({ onSelect, onBack, isOnline }) {
  return (
    <div className="kiosk-shell">
      <KioskHeader isOnline={isOnline} />

      <div className="kiosk-content service-grid-content">
        <p className="kiosk-eyebrow">Service: Quick Health Screening</p>
        <h1>What would you like to check?</h1>

        <div className="card-grid">
          {OPTIONS.map((o) => (
            <button key={o.mode} className="service-card" onClick={() => onSelect(o.mode)}>
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