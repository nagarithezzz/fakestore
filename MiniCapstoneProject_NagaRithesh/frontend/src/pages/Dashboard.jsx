import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { listMyCdr } from "../api/cdrApi.js";
import { listMyBills } from "../api/billingApi.js";
import { Loader } from "../components/Loader.jsx";

export function Dashboard() {
  const { role } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== "customer") {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [cdr, bills] = await Promise.all([listMyCdr({ limit: 500 }), listMyBills()]);
        if (cancelled) return;
        const pending = bills.filter((b) => b.status === "pending").length;
        setStats({ records: cdr.length, pendingBills: pending });
      } catch {
        setStats({ records: 0, pendingBills: 0 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [role]);

  if (role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (loading) {
    return (
      <div className="page">
        <Loader />
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Home</h1>
      <p className="muted">Welcome to your telecom usage and billing portal.</p>
      <div className="grid-2">
        <div className="card">
          <h2>Usage records</h2>
          <p className="stat">{stats?.records ?? 0}</p>
          <Link to="/usage" className="btn btn-secondary">
            View usage
          </Link>
        </div>
        <div className="card">
          <h2>Pending bills</h2>
          <p className="stat">{stats?.pendingBills ?? 0}</p>
          <Link to="/billing" className="btn btn-secondary">
            View billing
          </Link>
        </div>
      </div>
    </div>
  );
}
