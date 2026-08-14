// Matches PDF screen: "Welcome to NU Fairview Health Services Office" / TAP YOUR STUDENT ID
export default function WelcomeScreen({ onManualEntry }) {
  return (
    <div className="screen welcome-screen">
      <h1>Welcome to NU Fairview Health Services Office</h1>
      <p>Please check in to access health services</p>
      <div className="rfid-icon" />
      <h2>TAP YOUR STUDENT ID IN THE SCANNER</h2>
      <button onClick={onManualEntry}>Don't have your ID? Tap here for Manual Entry</button>
    </div>
  );
}
