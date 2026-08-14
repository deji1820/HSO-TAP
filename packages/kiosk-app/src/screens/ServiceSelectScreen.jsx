// Matches PDF: "What is the purpose of your visit?" (Step 2 of 2)
// NOTE: labels here must exactly match the QueueEntry.serviceType enum
// in packages/server/src/models/QueueEntry.js
const SERVICES = [
  { label: "Quick Health Screening", desc: "Self-Service Body Temperature, Height, Weight & BMI Calculation" },
  { label: "Medical Consultation", desc: "Medical consultation & Dental consultation" },
  { label: "Medical Clearance", desc: "Medical clearance, prescription & medicine" },
];

export default function ServiceSelectScreen({ onSelect, onCancel }) {
  return (
    <div className="screen">
      <h1>What is the purpose of your visit?</h1>
      <div className="card-grid">
        {SERVICES.map((s) => (
          <button key={s.label} className="service-card" onClick={() => onSelect(s.label)}>
            <h3>{s.label}</h3>
            <p>{s.desc}</p>
          </button>
        ))}
      </div>
      <button onClick={onCancel}>CANCEL / EXIT</button>
    </div>
  );
}