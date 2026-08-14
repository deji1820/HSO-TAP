// Shown after picking "Medical Clearance" on ServiceSelectScreen.
// Matches PDF spec: Other Services → choose Prescription/OTC vs General Inquiry.
const OPTIONS = [
  { subType: "Prescription/OTC", label: "Prescription / OTC Medicine", desc: "Pick up a prescription or over-the-counter medicine" },
  { subType: "General Inquiry", label: "General Inquiry", desc: "Ask a question or request a document (e.g. medical clearance)" },
];

export default function OtherServicesTypeScreen({ onSelect, onBack }) {
  return (
    <div className="screen">
      <h1>What do you need?</h1>
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
