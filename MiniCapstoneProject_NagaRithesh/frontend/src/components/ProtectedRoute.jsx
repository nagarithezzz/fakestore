import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Loader } from "./Loader.jsx";

export function ProtectedRoute({ children, role: requiredRole }) {
  const { loading, isAuthenticated, role, token } = useAuth();

  if (token && loading) return <Loader />;
  if (!token) return <Navigate to="/login" replace />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
