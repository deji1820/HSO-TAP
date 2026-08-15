import KioskHeader from "../components/KioskHeader.jsx";
import "../styles/screens/Capturing.css";

const MODE_COPY = {
  complete: { title: "Measuring temperature, height & weight", instruction: "Please stand still on the platform." },
  temperature: { title: "Measuring temperature", instruction: "Hold still — the thermal sensor is scanning." },
  physical: { title: "Measuring height & weight", instruction: "Please stand still on the platform." },
};

export default function CapturingScreen({ mode, readings, isMock, bridge, onCancel, isOnline }) {
  const copy = MODE_COPY[mode];
  const needsTemp = mode === "complete" || mode === "temperature";
  const needsPhysical = mode === "complete" || mode === "physical";

  return (
    <div className="kiosk-shell">
      <KioskHeader isOnline={isOnline} />

      <div className="kiosk-content">
        <div className="capturing-pulse">
          <div className="capturing-pulse-ring" />
          <div className="capturing-pulse-core" />
        </div>

        <h1>{copy.title}</h1>
        <p className="kiosk-subtitle">{copy.instruction}</p>

        <div className="kiosk-card reading-status">
          {needsTemp && (
            <div className={"reading-row" + (readings.temperatureC != null ? " done" : "")}>
              <span>{readings.temperatureC != null ? "✓" : "⏳"}</span>
              Temperature: {readings.temperatureC != null ? `${readings.temperatureC}°C` : "waiting..."}
            </div>
          )}
          {needsPhysical && (
            <>
              <div className={"reading-row" + (readings.heightCm != null ? " done" : "")}>
                <span>{readings.heightCm != null ? "✓" : "⏳"}</span>
                Height: {readings.heightCm != null ? `${readings.heightCm} cm` : "waiting..."}
              </div>
              <div className={"reading-row" + (readings.weightKg != null ? " done" : "")}>
                <span>{readings.weightKg != null ? "✓" : "⏳"}</span>
                Weight: {readings.weightKg != null ? `${readings.weightKg} kg` : "waiting..."}
              </div>
            </>
          )}
        </div>

        {isMock && (
          <div className="mock-controls">
            <p className="mock-controls-label">Mock hardware controls (dev only)</p>
            <div className="mock-controls-row">
              {needsTemp && <button className="btn-kiosk-muted mock-btn" onClick={() => bridge.simulateTemperature(36.7)}>Simulate normal temp</button>}
              {needsTemp && <button className="btn-kiosk-muted mock-btn" onClick={() => bridge.simulateTemperature(38.2)}>Simulate fever temp</button>}
              {needsPhysical && <button className="btn-kiosk-muted mock-btn" onClick={() => bridge.simulateHeightWeight(170, 62)}>Simulate height/weight</button>}
            </div>
          </div>
        )}

        <button className="btn-kiosk btn-kiosk-danger-outline capturing-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}