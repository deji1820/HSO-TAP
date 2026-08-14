// Generic "you're in the queue" confirmation, shown after the Medical
// Consultation and Medical Clearance flows finish submitting — mirrors
// ResultScreen's role for the Quick Health Screening flow, but without
// vitals/BMI since neither of these flows is self-service-exit.
//
// ASSUMPTION: expects submitIntake's response to optionally include
// `queueNumber` (per handoff Section 5, item 6 — queue numbering isn't
// built yet, so this may render blank until that's in place). Renders
// gracefully either way.
export default function CheckedInScreen({ info, onDone }) {
  return (
    <div className="screen checked-in-screen">
      <h1>You're checked in</h1>
      <p>Please have a seat — a staff member will call you shortly.</p>

      <div className="checkin-summary">
        {info?.serviceType && <p>Service: {info.serviceType}{info?.subType ? ` — ${info.subType}` : ""}</p>}
        {info?.queueNumber && <p className="queue-number">Queue Number: {info.queueNumber}</p>}
      </div>

      <button onClick={onDone}>Done</button>
    </div>
  );
}
