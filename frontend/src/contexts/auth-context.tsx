"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";

export interface User {
  id: string;
  email: string;
  status: string;
  roles: string[];
  full_name_en?: string;
  full_name_km?: string;
  province?: string;
  current_education_level?: string;
  preferred_language?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async (authToken?: string | null) => {
    try {
      const activeToken = authToken || localStorage.getItem("futera_access_token");
      if (!activeToken) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const userData = await apiFetch<User>("/auth/me", { token: activeToken });
      setUser(userData);
      setToken(activeToken);
    } catch (e) {
      setUser(null);
      setToken(null);
      localStorage.removeItem("futera_access_token");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiFetch<{ access_token: string; role: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const accessToken = res.access_token;
    localStorage.setItem("futera_access_token", accessToken);
    setToken(accessToken);
    await fetchCurrentUser(accessToken);
  };

  const register = async (data: any) => {
    const res = await apiFetch<{ access_token: string; role: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const accessToken = res.access_token;
    localStorage.setItem("futera_access_token", accessToken);
    setToken(accessToken);
    await fetchCurrentUser(accessToken);
  };

  const logout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (e) {
      // Ignore
    } finally {
      localStorage.removeItem("futera_access_token");
      setUser(null);
      setToken(null);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser(token);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
