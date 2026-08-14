// Matches PDF: "What would you like to check?" (Service: Quick Health Screening)
const OPTIONS = [
  { mode: "complete", label: "Complete Check", desc: "Body Temperature, Height, Weight & BMI Calculation" },
  { mode: "temperature", label: "Body Temperature", desc: "Quick thermal scan using the sensor" },
  { mode: "physical", label: "Physical Metrics", desc: "Height, Weight & BMI Calculation" },
];

export default function ScreeningOptionsScreen({ onSelect, onBack }) {
  return (
    <div className="screen">
      <h1>What would you like to check?</h1>
      <div className="card-grid">
        {OPTIONS.map((o) => (
          <button key={o.mode} className="service-card" onClick={() => onSelect(o.mode)}>
            <h3>{o.label}</h3>
            <p>{o.desc}</p>
          </button>
        ))}
      </div>
      <button onClick={onBack}>Back to service selection</button>
    </div>
  );
}
