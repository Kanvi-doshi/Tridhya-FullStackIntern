"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, registerUser } from "@/service/auth.service";
import { saveAuth, getToken, getUser, clearAuth } from "@/components/utils/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }

    setLoading(false);
  }, []);

  async function login(credentials) {
    const response = await loginUser(credentials);

    const { token, user } = response;

    saveAuth(token, user);

    setToken(token);
    setUser(user);

    return response;
  }

  async function register(userData) {
    return registerUser(userData);
  }

  function logout() {
    clearAuth();
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
