import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api.js";
import "../styles/pages/Login.css";

const eyeOpen = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const eyeClosed = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 3l18 18" strokeLinecap="round" />
    <path d="M10.6 5.2A11.6 11.6 0 0 1 12 5c7 0 11 7 11 7a17.6 17.6 0 0 1-3.4 4.2M6.5 6.6C3.7 8.3 1 12 1 12s4 7 11 7c1.4 0 2.7-.2 3.9-.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.5 9.6a3 3 0 0 0 4.2 4.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function LoginPage({ onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await login(email, password);
      localStorage.setItem("hsotap_token", token);
      localStorage.setItem("hsotap_user", JSON.stringify(user));
      onLoggedIn(user);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Invalid email or password."
          : "Could not reach the server. Is it running?"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-photo-panel">
        <div className="login-card">
          <h1>Login</h1>
          <p>Welcome to NU Fairview Health Services Office Clinic Management System</p>

          <form onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              className="text-input"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className="field-label" htmlFor="login-password">Password</label>
            <div className="password-field">
              <input
                id="login-password"
                className="text-input"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? eyeOpen : eyeClosed}
              </button>
            </div>

            <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>
              Forgot Password
            </a>

            {error && <p className="login-error">{error}</p>}

            <button className="btn btn-primary login-submit" type="submit" disabled={loading}>
              {loading ? "Logging in…" : "Login"}
            </button>
          </form>
        </div>
      </div>

      <div className="login-brand-panel">
        <div className="login-crest">NU</div>
        <h2>NU FAIRVIEW</h2>
        <p>Health Services Office</p>
        <div className="login-copyright">Copyright All Rights Reserved 2026</div>
      </div>
    </div>
  );
}