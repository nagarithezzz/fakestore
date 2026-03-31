import { useEffect, useState } from "react";
import { listPlans, createPlan } from "../api/planApi.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";
import { Loader } from "../components/Loader.jsx";

export function PlansPage() {
  const { role } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", call_rate: "0.5", sms_rate: "0.1", data_rate: "0.01" });
  const [saving, setSaving] = useState(false);

  async function load() {
    const data = await listPlans();
    setPlans(data);
  }

  useEffect(() => {
    load()
      .catch((e) => setError(e.response?.data?.detail || "Failed to load plans"))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createPlan({
        name: form.name,
        call_rate: Number(form.call_rate),
        sms_rate: Number(form.sms_rate),
        data_rate: Number(form.data_rate),
      });
      setForm({ name: "", call_rate: "0.5", sms_rate: "0.1", data_rate: "0.01" });
      await load();
    } catch (e) {
      setError(e.response?.data?.detail || "Could not create plan");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader />;

  return (
    <div className="page">
      <h1>Plans</h1>
      <p className="muted">Available tariff plans (rates per unit).</p>
      {error && <p className="error">{error}</p>}
      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Call / min</th>
              <th>SMS</th>
              <th>Data / MB</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{formatCurrency(p.call_rate)}</td>
                <td>{formatCurrency(p.sms_rate)}</td>
                <td>{formatCurrency(p.data_rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {role === "admin" && (
        <div className="card">
          <h2>Add plan</h2>
          <form onSubmit={handleCreate} className="stack form-inline">
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </label>
            <label>
              Call rate
              <input
                type="number"
                step="0.01"
                value={form.call_rate}
                onChange={(e) => setForm((f) => ({ ...f, call_rate: e.target.value }))}
                required
              />
            </label>
            <label>
              SMS rate
              <input
                type="number"
                step="0.01"
                value={form.sms_rate}
                onChange={(e) => setForm((f) => ({ ...f, sms_rate: e.target.value }))}
                required
              />
            </label>
            <label>
              Data rate
              <input
                type="number"
                step="0.001"
                value={form.data_rate}
                onChange={(e) => setForm((f) => ({ ...f, data_rate: e.target.value }))}
                required
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Create plan"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
