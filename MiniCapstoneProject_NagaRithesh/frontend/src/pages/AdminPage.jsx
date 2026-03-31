import { useEffect, useState } from "react";
import { getReports, listUsers } from "../api/adminApi.js";
import { addCdr } from "../api/cdrApi.js";
import { generateBill } from "../api/billingApi.js";
import { createPlan } from "../api/planApi.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { Loader } from "../components/Loader.jsx";

export function AdminPage() {
  const [reports, setReports] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [cdrForm, setCdrForm] = useState({
    user_id: "",
    type: "call",
    duration: "0",
    data_used: "0",
    destination_number: "",
  });
  const [billForm, setBillForm] = useState({ user_id: "", billing_cycle: "" });
  const [planForm, setPlanForm] = useState({
    name: "",
    call_rate: "0.5",
    sms_rate: "0.1",
    data_rate: "0.01",
  });
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const [r, u] = await Promise.all([getReports(), listUsers()]);
    setReports(r);
    setUsers(u);
  }

  useEffect(() => {
    refresh()
      .catch((e) => setError(e.response?.data?.detail || "Failed to load admin data"))
      .finally(() => setLoading(false));
  }, []);

  async function submitCdr(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMsg("");
    try {
      await addCdr({
        user_id: Number(cdrForm.user_id),
        type: cdrForm.type,
        duration: Number(cdrForm.duration) || 0,
        data_used: Number(cdrForm.data_used) || 0,
        destination_number: cdrForm.destination_number || null,
      });
      setMsg("CDR record added.");
      await refresh();
    } catch (e) {
      setError(e.response?.data?.detail || "Could not add CDR");
    } finally {
      setBusy(false);
    }
  }

  async function submitBill(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMsg("");
    try {
      await generateBill({
        user_id: Number(billForm.user_id),
        billing_cycle: billForm.billing_cycle,
      });
      setMsg("Bill generated.");
      await refresh();
    } catch (e) {
      setError(e.response?.data?.detail || "Could not generate bill");
    } finally {
      setBusy(false);
    }
  }

  async function submitPlan(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMsg("");
    try {
      await createPlan({
        name: planForm.name,
        call_rate: Number(planForm.call_rate),
        sms_rate: Number(planForm.sms_rate),
        data_rate: Number(planForm.data_rate),
      });
      setMsg("Plan created.");
      setPlanForm({ name: "", call_rate: "0.5", sms_rate: "0.1", data_rate: "0.01" });
    } catch (e) {
      setError(e.response?.data?.detail || "Could not create plan");
    } finally {
      setBusy(false);
    }
  }

  if (loading || !reports) return <Loader />;

  return (
    <div className="page">
      <h1>Admin overview</h1>
      <p className="muted">Usage and revenue summary; manage CDR, billing, and plans.</p>
      {error && <p className="error">{error}</p>}
      {msg && <p className="success">{msg}</p>}

      <div className="grid-3">
        <div className="card compact">
          <strong>Users</strong>
          <span className="stat small">{reports.total_users}</span>
        </div>
        <div className="card compact">
          <strong>CDR records</strong>
          <span className="stat small">{reports.total_cdr_records}</span>
        </div>
        <div className="card compact">
          <strong>Bills</strong>
          <span className="stat small">{reports.total_bills}</span>
        </div>
        <div className="card compact">
          <strong>Revenue (paid)</strong>
          <span className="stat small">{formatCurrency(reports.total_revenue_paid)}</span>
        </div>
        <div className="card compact">
          <strong>Revenue (pending)</strong>
          <span className="stat small">{formatCurrency(reports.total_revenue_pending)}</span>
        </div>
      </div>

      <div className="card table-wrap">
        <h2>Users</h2>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Role</th>
              <th>Plan ID</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.mobile_number}</td>
                <td>{u.role}</td>
                <td>{u.plan_id ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>Add CDR</h2>
          <form onSubmit={submitCdr} className="stack">
            <label>
              User ID
              <input
                type="number"
                value={cdrForm.user_id}
                onChange={(e) => setCdrForm((f) => ({ ...f, user_id: e.target.value }))}
                required
                min={1}
              />
            </label>
            <label>
              Type
              <select
                value={cdrForm.type}
                onChange={(e) => setCdrForm((f) => ({ ...f, type: e.target.value }))}
              >
                <option value="call">call</option>
                <option value="sms">sms</option>
                <option value="data">data</option>
              </select>
            </label>
            <label>
              Duration (seconds)
              <input
                type="number"
                value={cdrForm.duration}
                onChange={(e) => setCdrForm((f) => ({ ...f, duration: e.target.value }))}
                min={0}
              />
            </label>
            <label>
              Data used (MB)
              <input
                type="number"
                step="0.1"
                value={cdrForm.data_used}
                onChange={(e) => setCdrForm((f) => ({ ...f, data_used: e.target.value }))}
                min={0}
              />
            </label>
            <label>
              Destination number
              <input
                value={cdrForm.destination_number}
                onChange={(e) => setCdrForm((f) => ({ ...f, destination_number: e.target.value }))}
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              Add record
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Generate bill</h2>
          <form onSubmit={submitBill} className="stack">
            <label>
              User ID
              <input
                type="number"
                value={billForm.user_id}
                onChange={(e) => setBillForm((f) => ({ ...f, user_id: e.target.value }))}
                required
                min={1}
              />
            </label>
            <label>
              Billing cycle (YYYY-MM)
              <input
                placeholder="2026-03"
                value={billForm.billing_cycle}
                onChange={(e) => setBillForm((f) => ({ ...f, billing_cycle: e.target.value }))}
                required
                pattern="\d{4}-\d{2}"
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              Generate
            </button>
          </form>
        </div>
      </div>

      <div className="card">
        <h2>Create plan</h2>
        <form onSubmit={submitPlan} className="stack form-inline">
          <label>
            Name
            <input
              value={planForm.name}
              onChange={(e) => setPlanForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </label>
          <label>
            Call rate
            <input
              type="number"
              step="0.01"
              value={planForm.call_rate}
              onChange={(e) => setPlanForm((f) => ({ ...f, call_rate: e.target.value }))}
              required
            />
          </label>
          <label>
            SMS rate
            <input
              type="number"
              step="0.01"
              value={planForm.sms_rate}
              onChange={(e) => setPlanForm((f) => ({ ...f, sms_rate: e.target.value }))}
              required
            />
          </label>
          <label>
            Data rate
            <input
              type="number"
              step="0.001"
              value={planForm.data_rate}
              onChange={(e) => setPlanForm((f) => ({ ...f, data_rate: e.target.value }))}
              required
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            Create plan
          </button>
        </form>
      </div>
    </div>
  );
}
