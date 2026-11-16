"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  avatar_url?: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User | null>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const previousUserId = useRef<string | null>(null);
  const userRef = useRef<User | null>(null);

  const clearSessionCache = useCallback(() => {
    // User-specific queries share static keys (dashboard-summary, favorites,
    // recommendations…). Drop them so the next account never renders the
    // previous student's cached data without a hard refresh.
    queryClient.clear();

    // Assessment drafts are also account-scoped. Leaving them behind would
    // show the previous student's answers to the next user.
    if (typeof window !== "undefined") {
      // Purge legacy bearer tokens from older builds and account-scoped drafts.
      localStorage.removeItem("futera_access_token");
      localStorage.removeItem("futera_personality_draft_v1");
      localStorage.removeItem("futera_riasec_draft_v1");
    }
  }, [queryClient]);

  const clearSessionHint = useCallback(() => {
    if (typeof document !== "undefined") {
      document.cookie = "futera_session=; Max-Age=0; path=/";
    }
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      // The hint cookie only says a session *may* exist; it is not a token.
      // Signed-out visitors skip the /auth/me round-trip entirely.
      if (
        typeof document !== "undefined" &&
        !document.cookie
          .split("; ")
          .some((entry) => entry.startsWith("futera_session="))
      ) {
        setUser(null);
        setIsLoading(false);
        return null;
      }

      // Cookies are httpOnly, so the browser sends them automatically.
      const userData = await apiFetch<User>("/auth/me");
      setUser(userData);
      return userData;
    } catch {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Defensive: if the authenticated identity changes through any flow,
  // drop user-scoped queries instead of serving the previous account's data.
  useEffect(() => {
    userRef.current = user;
    if (
      user?.id &&
      previousUserId.current &&
      previousUserId.current !== user.id
    ) {
      clearSessionCache();
    }
    previousUserId.current = user?.id ?? null;
  }, [user, clearSessionCache]);

  // The API client emits this when the refresh cookie is no longer valid.
  useEffect(() => {
    const handleExpired = () => {
      // Always drop the stale session hint. A signed-out visitor can hit a 401
      // while browsing public pages, so only clear user caches when a user was
      // actually signed in.
      clearSessionHint();
      if (!userRef.current) return;
      clearSessionCache();
      setUser(null);
    };
    window.addEventListener("futera:session-expired", handleExpired);
    return () =>
      window.removeEventListener("futera:session-expired", handleExpired);
  }, [clearSessionCache, clearSessionHint]);

  const login = async (
    email: string,
    password: string,
    rememberMe = true
  ) => {
    // The backend sets httpOnly access + refresh cookies on this response.
    await apiFetch("/auth/login?cookie_only=true", {
      method: "POST",
      body: JSON.stringify({ email, password, remember_me: rememberMe }),
    });
    clearSessionCache();
    return await fetchCurrentUser();
  };

  const register = async (data: any) => {
    await apiFetch("/auth/register?cookie_only=true", {
      method: "POST",
      body: JSON.stringify(data),
    });
    clearSessionCache();
    await fetchCurrentUser();
  };

  const logout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // The local session is cleared even if the server call fails.
    } finally {
      clearSessionCache();
      clearSessionHint();
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
