import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function Navbar() {
  const { role, logout } = useAuth();

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        Telecom CDR
      </Link>
      <nav className="nav-links">
        {role === "customer" && (
          <>
            <NavLink to="/" end>
              Home
            </NavLink>
            <NavLink to="/usage">Usage</NavLink>
            <NavLink to="/billing">Billing</NavLink>
          </>
        )}
        {role === "admin" && (
          <NavLink to="/admin" end>
            Overview
          </NavLink>
        )}
        <NavLink to="/plans">Plans</NavLink>
        <button type="button" className="btn btn-ghost" onClick={logout}>
          Log out
        </button>
      </nav>
    </header>
  );
}
