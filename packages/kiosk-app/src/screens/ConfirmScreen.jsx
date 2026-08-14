// Matches PDF screen: "Step 1 of 2: Identity Verification" — shown right
// after a successful RFID tap or Manual Entry lookup, before service
// selection (which the PDF labels "Step 2 of 2", see ServiceSelectScreen).
//
// ASSUMPTION (flag for review against the actual mockup): field names below
// (firstName, lastName, course, yearLevel, studentId) follow the shape used
// by scripts/seedStudent.js. Adjust if the real /students/lookup response
// uses different keys.
export default function ConfirmScreen({ student, onConfirm, onNotMe }) {
  const fullName = [student?.firstName, student?.lastName].filter(Boolean).join(" ") || "Unknown Student";

  return (
    <div className="screen confirm-screen">
      <p className="step-label">Step 1 of 2: Identity Verification</p>
      <h1>Is this your profile?</h1>

      <div className="profile-icon" />

      <div className="profile-card">
        <h2>{fullName}</h2>
        <p>Student ID: {student?.studentId ?? "—"}</p>
        {student?.program && <p>{student.program}</p>}
        {student?.yearLevel && <p>{student.yearLevel}</p>}
      </div>

      <button onClick={onConfirm}>Yes, this is me</button>
      <button onClick={onNotMe}>No, that's not me</button>
    </div>
  );
}