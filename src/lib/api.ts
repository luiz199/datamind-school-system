const BASE = "/api";

async function req(path: string, options?: RequestInit) {
  const token = typeof window !== "undefined" ? localStorage.getItem("eduplan_token") : null;
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options?.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erro na requisição");
  return data;
}

export const api = {
  login: (email: string, password: string) => req("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (data: { nome: string; email: string; password: string; tipo: string }) => req("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  me: () => req("/auth/me"),
  planos: {
    list: () => req("/planos"),
    create: (data: any) => req("/planos", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => req(`/planos/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    remove: (id: string) => req(`/planos/${id}`, { method: "DELETE" }),
  },
  users: {
    list: () => req("/users"),
    create: (data: any) => req("/users", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => req("/users", { method: "PATCH", body: JSON.stringify({ id, ...data }) }),
    delete: (id: string) => req(`/users?id=${id}`, { method: "DELETE" }),
  },
  logs: {
    list: () => req("/logs"),
    create: (data: any) => req("/logs", { method: "POST", body: JSON.stringify(data) }),
  },
  config: {
    get: () => req("/config"),
    save: (data: any) => req("/config", { method: "PUT", body: JSON.stringify(data) }),
  },
};
