"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { User } from "@/types";
import { getDarkMode, saveDarkMode } from "@/lib/storage";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string>;
  register: (data: { nome: string; email: string; password: string; tipo: "professor" | "coordenador" | "admin" }) => Promise<string>;
  logout: () => Promise<void>;
  updateUserData: (data: Partial<User>) => Promise<void>;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function seedUsers() {
  try { await fetch("/api/auth/seed", { method: "POST" }); } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkModeState] = useState(false);

  useEffect(() => {
    (async () => {
      await seedUsers();
      const token = localStorage.getItem("eduplan_token");
      if (token) {
        try {
          const data = await api.me();
          setUser(data.user);
        } catch {
          localStorage.removeItem("eduplan_token");
        }
      }
      const savedDark = getDarkMode();
      setDarkModeState(savedDark);
      document.documentElement.classList.toggle("dark", savedDark);
      setLoading(false);
    })();
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkModeState((prev) => {
      const next = !prev;
      saveDarkMode(next);
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login(email, password);
    localStorage.setItem("eduplan_token", data.token);
    setUser(data.user);
    return data.user.tipo;
  }, []);

  const register = useCallback(async (data: { nome: string; email: string; password: string; tipo: "professor" | "coordenador" | "admin" }) => {
    const res = await api.register({ nome: data.nome, email: data.email, password: data.password, tipo: data.tipo });
    localStorage.setItem("eduplan_token", res.token);
    setUser(res.user);
    return res.user.tipo;
  }, []);

  const logout = useCallback(async () => {
    try { await fetch("/api/auth/session", { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("eduplan_token")}` } }); } catch {}
    setUser(null);
    localStorage.removeItem("eduplan_token");
  }, []);

  const updateUserData = useCallback(async (data: Partial<User>) => {
    if (!user) return;
    setUser((prev) => prev ? { ...prev, ...data } : null);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserData, darkMode, toggleDarkMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
