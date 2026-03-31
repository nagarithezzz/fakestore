import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Layout } from "../components/Layout.jsx";
import { ProtectedRoute } from "../components/ProtectedRoute.jsx";
import { Loader } from "../components/Loader.jsx";
import { Login } from "../pages/Login.jsx";
import { Register } from "../pages/Register.jsx";
import { Dashboard } from "../pages/Dashboard.jsx";
import { UsagePage } from "../pages/UsagePage.jsx";
import { BillingPage } from "../pages/BillingPage.jsx";
import { PlansPage } from "../pages/PlansPage.jsx";
import { AdminPage } from "../pages/AdminPage.jsx";

function AuthGate({ children }) {
  const { loading, isAuthenticated, token } = useAuth();
  if (token && loading) {
    return (
      <div className="centered">
        <Loader />
      </div>
    );
  }
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <AuthGate>
            <Login />
          </AuthGate>
        }
      />
      <Route
        path="/register"
        element={
          <AuthGate>
            <Register />
          </AuthGate>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route
          path="/usage"
          element={
            <ProtectedRoute role="customer">
              <UsagePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing"
          element={
            <ProtectedRoute role="customer">
              <BillingPage />
            </ProtectedRoute>
          }
        />
        <Route path="/plans" element={<PlansPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
