import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar.jsx";

export function Layout() {
  return (
    <div className="layout">
      <Navbar />
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
