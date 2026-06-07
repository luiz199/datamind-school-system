import { PlanoAula, Log } from "@/types";
import { api } from "./api";

const DARK_KEY = "eduplan_dark";

/* ── Planos ── */
export async function getPlanos(): Promise<PlanoAula[]> {
  try { return await api.planos.list(); } catch { return []; }
}

export async function updatePlanoStatus(id: string, status: PlanoAula["status"], nota?: number, comentario?: string) {
  try { await api.planos.update(id, { status, ...(nota !== undefined && { nota }), ...(comentario && { comentario }) }); } catch {}
}

export async function addPlano(plano: PlanoAula) {
  try { await api.planos.create(plano); } catch {}
}

export async function deletePlano(id: string) {
  try { await api.planos.remove(id); return true; } catch { return false; }
}

/* ── Config ── */
export interface SystemConfig {
  nome: string;
  pontosEnvio: number;
  pontosAprovacao: number;
  bonusDestaque: number;
  manutencao: boolean;
}

const defaultConfig: SystemConfig = {
  nome: "EduPlan Manager",
  pontosEnvio: 10,
  pontosAprovacao: 20,
  bonusDestaque: 50,
  manutencao: false,
};

export async function getConfig(): Promise<SystemConfig> {
  try { return await api.config.get(); } catch { return defaultConfig; }
}

export async function saveConfig(config: SystemConfig) {
  try { await api.config.save(config); } catch {}
}

/* ── Logs ── */
export async function getLogs(): Promise<Log[]> {
  try { return await api.logs.list(); } catch { return []; }
}

export async function addLog(log: Omit<Log, "id"> & { id?: string }) {
  try { await api.logs.create(log); } catch {}
}

/* ── Notifications ── */
export async function createNotification(data: { usuarioId: string; tipo: string; titulo: string; mensagem: string }) {
  try {
    await fetch("/api/notificacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("eduplan_token")}` },
      body: JSON.stringify({ ...data, lida: false, createdAt: new Date() }),
    });
  } catch {}
}

export async function getNotifications(): Promise<any[]> {
  try {
    const token = localStorage.getItem("eduplan_token");
    const res = await fetch("/api/notificacoes", { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

export async function markNotificationsRead() {
  try {
    const token = localStorage.getItem("eduplan_token");
    await fetch("/api/notificacoes", { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
  } catch {}
}

/* ── Dark Mode (localStorage, stays sync) ── */
export function getDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  try { return JSON.parse(localStorage.getItem(DARK_KEY) || "false"); } catch { return false; }
}

export function saveDarkMode(dark: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DARK_KEY, JSON.stringify(dark));
}

/* ── Users ── */
export async function getUsers(): Promise<any[]> {
  try { return await api.users.list(); } catch { return []; }
}

export async function saveUsers(users: any[]) {
  try {
    for (const u of users) {
      await api.users.update(u.id, { pontuacao: u.pontuacao, nivel: u.nivel });
    }
  } catch {}
}
