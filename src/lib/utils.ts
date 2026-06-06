import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateProtocol(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${result}-${Date.now().toString(36).toUpperCase()}`;
}

export function getPontosByStatus(status: string): number {
  switch (status) {
    case "enviado": return 10;
    case "aprovado": return 20;
    case "destaque": return 50;
    default: return 0;
  }
}

export function getNivel(pontuacao: number): { nivel: number; titulo: string; nextLevel: number } {
  if (pontuacao < 100) return { nivel: 1, titulo: "Estagiário", nextLevel: 100 };
  if (pontuacao < 300) return { nivel: 2, titulo: "Professor Júnior", nextLevel: 300 };
  if (pontuacao < 600) return { nivel: 3, titulo: "Professor Pleno", nextLevel: 600 };
  if (pontuacao < 1000) return { nivel: 4, titulo: "Professor Sênior", nextLevel: 1000 };
  if (pontuacao < 1500) return { nivel: 5, titulo: "Mestre Educador", nextLevel: 1500 };
  if (pontuacao < 2200) return { nivel: 6, titulo: "Doutor em Educação", nextLevel: 2200 };
  if (pontuacao < 3000) return { nivel: 7, titulo: "Líder Pedagógico", nextLevel: 3000 };
  return { nivel: 8, titulo: "Lenda da Educação", nextLevel: pontuacao + 1000 };
}
