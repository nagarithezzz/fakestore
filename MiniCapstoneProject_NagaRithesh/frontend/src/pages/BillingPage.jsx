import { useEffect, useState } from "react";
import { listMyBills, payBill } from "../api/billingApi.js";
import { formatDate } from "../utils/formatDate.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { Loader } from "../components/Loader.jsx";

export function BillingPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState(null);

  async function load() {
    setError("");
    const data = await listMyBills();
    setRows(data);
  }

  useEffect(() => {
    load()
      .catch((e) => setError(e.response?.data?.detail || "Failed to load bills"))
      .finally(() => setLoading(false));
  }, []);

  async function handlePay(id) {
    setPayingId(id);
    setError("");
    try {
      await payBill(id);
      await load();
    } catch (e) {
      setError(e.response?.data?.detail || "Payment failed");
    } finally {
      setPayingId(null);
    }
  }

  if (loading) return <Loader />;

  return (
    <div className="page">
      <h1>Billing</h1>
      <p className="muted">Your generated bills by cycle.</p>
      {error && <p className="error">{error}</p>}
      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Cycle</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Generated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted">
                  No bills yet.
                </td>
              </tr>
            ) : (
              rows.map((b) => (
                <tr key={b.id}>
                  <td>{b.billing_cycle}</td>
                  <td>{formatCurrency(b.total_amount)}</td>
                  <td>
                    <span className={`pill pill-${b.status}`}>{b.status}</span>
                  </td>
                  <td>{formatDate(b.generated_at)}</td>
                  <td>
                    {b.status === "pending" && (
                      <button
                        type="button"
                        className="btn btn-primary btn-small"
                        disabled={payingId === b.id}
                        onClick={() => handlePay(b.id)}
                      >
                        {payingId === b.id ? "…" : "Pay"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
