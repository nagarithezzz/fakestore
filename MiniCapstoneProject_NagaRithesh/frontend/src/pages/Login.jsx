import { useState } from "react";
import { Link } from "react-router-dom";
import { login as loginApi } from "../api/authApi.js";
import { useAuth } from "../context/AuthContext.jsx";

export function Login() {
  const { login } = useAuth();
  const [mobile_number, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const data = await loginApi({ mobile_number, password });
      await login(data.access_token);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1>Sign in</h1>
        <p className="muted">Use your mobile number and password.</p>
        <form onSubmit={handleSubmit} className="stack">
          <label>
            Mobile number
            <input
              value={mobile_number}
              onChange={(e) => setMobile(e.target.value)}
              required
              autoComplete="username"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="muted small">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
