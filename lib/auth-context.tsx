"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials, logout as logoutAction, setUser as setUserAction, authApi } from "@/store/features/auth/authSlice";

const TOKEN_KEY = "mediReferToken";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        try {
          const profile = await dispatch(authApi.endpoints.getProfile.initiate()).unwrap();
          dispatch(setUserAction(profile));
        } catch {
          console.error("Session expired or invalid token");
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await dispatch(authApi.endpoints.login.initiate({ email, password })).unwrap();
      // Since authSlice's extraReducers handle login.matchFulfilled,
      // token and user will be set in state automatically.
      router.push("/dashboard");
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    dispatch(logoutAction());
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, setUser: (u) => dispatch(setUserAction(u as User)) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}