import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { register as registerApi } from "../api/authApi.js";
import { listPlans } from "../api/planApi.js";
import { useAuth } from "../context/AuthContext.jsx";

export function Register() {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [mobile_number, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [plan_id, setPlanId] = useState("");
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listPlans()
      .then(setPlans)
      .catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const body = {
        name,
        mobile_number,
        password,
        plan_id: plan_id ? Number(plan_id) : null,
      };
      const data = await registerApi(body);
      await login(data.access_token);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1>Create account</h1>
        <form onSubmit={handleSubmit} className="stack">
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Mobile number
            <input value={mobile_number} onChange={(e) => setMobile(e.target.value)} required />
          </label>
          <label>
            Password (min 6 characters)
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>
          <label>
            Plan (optional)
            <select value={plan_id} onChange={(e) => setPlanId(e.target.value)}>
              <option value="">— None —</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Creating…" : "Register"}
          </button>
        </form>
        <p className="muted small">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
