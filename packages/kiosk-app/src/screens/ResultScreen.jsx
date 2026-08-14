function computeBmi(heightCm, weightKg) {
  if (!heightCm || !weightKg) return null;
  const m = heightCm / 100;
  return +(weightKg / (m * m)).toFixed(1);
}

export default function ResultScreen({ readings, overrideTriggered, queueNumber, onDone }) {
  const bmi = computeBmi(readings.heightCm, readings.weightKg);

  return (
    <div className="screen">
      {overrideTriggered ? (
        <>
          <h1 style={{ color: "#c0392b" }}>Please proceed inside the clinic immediately.</h1>
          <p>An abnormal temperature was detected. A staff member has been notified.</p>
          {queueNumber && <p className="queue-number">Queue Number: {queueNumber}</p>}
        </>
      ) : (
        <h1>All done — here's your reading</h1>
      )}

      <div className="reading-summary">
        {readings.temperatureC != null && <p>Temperature: {readings.temperatureC}°C</p>}
        {readings.heightCm != null && <p>Height: {readings.heightCm} cm</p>}
        {readings.weightKg != null && <p>Weight: {readings.weightKg} kg</p>}
        {bmi != null && <p>BMI: {bmi}</p>}
      </div>

      <button onClick={onDone}>Done</button>
    </div>
  );
}