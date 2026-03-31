import { useEffect, useMemo, useState } from "react";
import { listMyCdr } from "../api/cdrApi.js";
import { formatDate } from "../utils/formatDate.js";
import { Loader } from "../components/Loader.jsx";

export function UsagePage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listMyCdr({ limit: 200 })
      .then(setRows)
      .catch((e) => setError(e.response?.data?.detail || "Failed to load usage"))
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    const byType = { call: 0, sms: 0, data: 0 };
    let callMinutes = 0;
    let dataMb = 0;
    for (const r of rows) {
      byType[r.type] = (byType[r.type] || 0) + 1;
      if (r.type === "call") callMinutes += r.duration || 0;
      if (r.type === "data") dataMb += r.data_used || 0;
    }
    return { byType, callMinutes, dataMb };
  }, [rows]);

  if (loading) return <Loader />;

  return (
    <div className="page">
      <h1>Usage</h1>
      <p className="muted">Your call, SMS, and data records.</p>
      {error && <p className="error">{error}</p>}
      <div className="grid-3">
        <div className="card compact">
          <strong>Calls</strong>
          <span className="stat small">{summary.byType.call}</span>
          <span className="muted small">{summary.callMinutes} sec total duration</span>
        </div>
        <div className="card compact">
          <strong>SMS</strong>
          <span className="stat small">{summary.byType.sms}</span>
        </div>
        <div className="card compact">
          <strong>Data</strong>
          <span className="stat small">{summary.byType.data}</span>
          <span className="muted small">{summary.dataMb.toFixed(1)} MB total</span>
        </div>
      </div>
      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Duration (sec)</th>
              <th>Data (MB)</th>
              <th>Destination</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted">
                  No records yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.type}</td>
                  <td>{r.duration}</td>
                  <td>{r.data_used}</td>
                  <td>{r.destination_number || "—"}</td>
                  <td>{formatDate(r.timestamp)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
