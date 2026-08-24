"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  role: string | null;
}

function readAuthFromStorage(): AuthState {
  if (typeof window === "undefined") {
    return { isAuthenticated: false, email: null, role: null };
  }
  const token = localStorage.getItem("access_token");
  return {
    isAuthenticated: !!token,
    email: localStorage.getItem("user_email"),
    role: localStorage.getItem("user_role"),
  };
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState | null>(null);

  useEffect(() => {
    // localStorage is an external, browser-only system (unavailable during SSR),
    // so reading it into state on mount is the correct "subscribe to external
    // system" effect pattern, not a derivable/computed value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(readAuthFromStorage());
  }, []);

  const login = useCallback((token: string, email: string, role: string) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user_email", email);
    localStorage.setItem("user_role", role);
    setState({ isAuthenticated: true, email, role });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_role");
    setState({ isAuthenticated: false, email: null, role: null });
    router.push("/login");
  }, [router]);

  return {
    isAuthenticated: state?.isAuthenticated ?? false,
    email: state?.email ?? null,
    role: state?.role ?? null,
    loading: state === null,
    login,
    logout,
  };
}
