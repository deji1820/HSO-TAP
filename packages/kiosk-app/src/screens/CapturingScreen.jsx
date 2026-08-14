// Shown while waiting for sensor reading(s). In mock mode, exposes buttons
// so you can test without real hardware — in production these buttons
// simply won't render, since the ESP32 fires the readings automatically.
const MODE_COPY = {
  complete: { title: "Measuring temperature, height & weight", instruction: "Please stand still on the platform." },
  temperature: { title: "Measuring temperature", instruction: "Hold still — the thermal sensor is scanning." },
  physical: { title: "Measuring height & weight", instruction: "Please stand still on the platform." },
};

export default function CapturingScreen({ mode, readings, isMock, bridge, onCancel }) {
  const copy = MODE_COPY[mode];
  const needsTemp = mode === "complete" || mode === "temperature";
  const needsPhysical = mode === "complete" || mode === "physical";

  return (
    <div className="screen">
      <h1>{copy.title}</h1>
      <p>{copy.instruction}</p>

      <div className="reading-status">
        {needsTemp && (
          <div>Temperature: {readings.temperatureC != null ? `${readings.temperatureC}°C ✓` : "waiting..."}</div>
        )}
        {needsPhysical && (
          <>
            <div>Height: {readings.heightCm != null ? `${readings.heightCm} cm ✓` : "waiting..."}</div>
            <div>Weight: {readings.weightKg != null ? `${readings.weightKg} kg ✓` : "waiting..."}</div>
          </>
        )}
      </div>

      {isMock && (
        <div className="mock-controls">
          <p><em>Mock hardware controls (dev only):</em></p>
          {needsTemp && <button onClick={() => bridge.simulateTemperature(36.7)}>Simulate normal temp</button>}
          {needsTemp && <button onClick={() => bridge.simulateTemperature(38.2)}>Simulate fever temp</button>}
          {needsPhysical && <button onClick={() => bridge.simulateHeightWeight(170, 62)}>Simulate height/weight</button>}
        </div>
      )}

      <button onClick={onCancel}>Cancel</button>
    </div>
  );
}
