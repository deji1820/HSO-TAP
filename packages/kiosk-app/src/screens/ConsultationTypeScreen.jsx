// Shown after picking "Medical Consultation" on ServiceSelectScreen.
// Matches PDF spec: Clinic Consultation → choose Medical vs Dental.
const OPTIONS = [
  { subType: "Medical", label: "Medical Consultation", desc: "See a nurse or doctor for a medical concern" },
  { subType: "Dental", label: "Dental Consultation", desc: "See the dental clinic for a dental concern" },
];

export default function ConsultationTypeScreen({ onSelect, onBack }) {
  return (
    <div className="screen">
      <h1>What type of consultation?</h1>
      <div className="card-grid">
        {OPTIONS.map((o) => (
          <button key={o.subType} className="service-card" onClick={() => onSelect(o.subType)}>
            <h3>{o.label}</h3>
            <p>{o.desc}</p>
          </button>
        ))}
      </div>
      <button onClick={onBack}>Back to service selection</button>
    </div>
  );
}
