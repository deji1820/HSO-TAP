import KioskHeader from "../components/KioskHeader.jsx";
import "../styles/screens/Result.css";

function computeBmi(heightCm, weightKg) {
  if (!heightCm || !weightKg) return null;
  const m = heightCm / 100;
  return +(weightKg / (m * m)).toFixed(1);
}

export default function ResultScreen({ readings, overrideTriggered, queueNumber, onDone, isOnline }) {
  const bmi = computeBmi(readings.heightCm, readings.weightKg);

  return (
    <div className="kiosk-shell">
      <KioskHeader isOnline={isOnline} />

      <div className="kiosk-content">
        {overrideTriggered ? (
          <>
            <div className="result-icon result-icon-alert">!</div>
            <h1 className="result-title-alert">Please proceed inside the clinic immediately.</h1>
            <p className="kiosk-subtitle">An abnormal temperature was detected. A staff member has been notified.</p>
            {queueNumber && (
              <div className="checkin-queue-block result-queue-block">
                <span className="checkin-queue-label">Queue Number</span>
                <span className="checkin-queue-number">{queueNumber}</span>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="result-icon result-icon-ok">✓</div>
            <h1>All done — here's your reading</h1>
          </>
        )}

        <div className="reading-summary-grid">
          {readings.temperatureC != null && (
            <div className="reading-summary-stat">
              <span className="reading-summary-label">Temperature</span>
              <span className="reading-summary-value">{readings.temperatureC}°C</span>
            </div>
          )}
          {readings.heightCm != null && (
            <div className="reading-summary-stat">
              <span className="reading-summary-label">Height</span>
              <span className="reading-summary-value">{readings.heightCm} cm</span>
            </div>
          )}
          {readings.weightKg != null && (
            <div className="reading-summary-stat">
              <span className="reading-summary-label">Weight</span>
              <span className="reading-summary-value">{readings.weightKg} kg</span>
            </div>
          )}
          {bmi != null && (
            <div className="reading-summary-stat">
              <span className="reading-summary-label">BMI</span>
              <span className="reading-summary-value">{bmi}</span>
            </div>
          )}
        </div>

        <button className="btn-kiosk btn-kiosk-primary result-done-btn" onClick={onDone}>
          Done
        </button>
      </div>
    </div>
  );
}