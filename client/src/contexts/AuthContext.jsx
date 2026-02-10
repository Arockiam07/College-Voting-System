import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(void 0);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("auth_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = useCallback((token2, user2) => {
    setToken(token2);
    setUser(user2);
    localStorage.setItem("auth_token", token2);
    localStorage.setItem("auth_user", JSON.stringify(user2));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  }, []);

  const isRole = useCallback((role) => user?.role === role, [user]);

  return <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout, isRole }}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export {
  AuthProvider,
  useAuth
};
