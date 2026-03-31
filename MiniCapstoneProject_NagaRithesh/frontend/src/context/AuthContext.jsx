import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { axiosInstance } from "../api/axiosInstance.js";

const AuthContext = createContext(null);

async function resolveRole() {
  try {
    await axiosInstance.get("/admin/reports");
    return "admin";
  } catch (e) {
    const status = e.response?.status;
    if (status === 401) throw e;
    try {
      await axiosInstance.get("/cdr/my", { params: { limit: 1 } });
      return "customer";
    } catch (e2) {
      if (e2.response?.status === 401) throw e2;
      throw new Error("Unable to determine account type.");
    }
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem("token"));

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setRole(null);
  }, []);

  const refreshRole = useCallback(async () => {
    const t = localStorage.getItem("token");
    if (!t) {
      setRole(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const r = await resolveRole();
      setRole(r);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      refreshRole();
    } else {
      setRole(null);
      setLoading(false);
    }
  }, [token, refreshRole]);

  const login = useCallback(
    async (accessToken) => {
      localStorage.setItem("token", accessToken);
      setToken(accessToken);
      await refreshRole();
    },
    [refreshRole]
  );

  const value = useMemo(
    () => ({
      token,
      role,
      loading,
      isAuthenticated: !!token && !!role,
      login,
      logout,
      refreshRole,
    }),
    [token, role, loading, login, logout, refreshRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
