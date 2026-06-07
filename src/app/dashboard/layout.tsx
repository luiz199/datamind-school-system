"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Send, BarChart3, Trophy, Bell, Users,
  Settings, LogOut, Menu, X, Sun, Moon, ClipboardCheck, ShieldCheck, FileText, Search,
  GraduationCap, User, MessageSquareText,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileModal from "@/components/ProfileModal";

const professorLinks = [
  { href: "/dashboard/professor", icon: LayoutDashboard, label: "Visão Geral" },
  { href: "/dashboard/professor?tab=enviar", icon: Send, label: "Novo Plano" },
  { href: "/dashboard/professor?tab=meus-planos", icon: FileText, label: "Meus Planos" },
  { href: "/dashboard/professor?tab=ranking", icon: Trophy, label: "Ranking" },
  { href: "/dashboard/professor?tab=chat", icon: MessageSquareText, label: "Chat" },
];

const coordenadorLinks = [
  { href: "/dashboard/coordenador", icon: LayoutDashboard, label: "Visão Geral" },
  { href: "/dashboard/coordenador?tab=planos", icon: ClipboardCheck, label: "Revisar" },
  { href: "/dashboard/coordenador?tab=relatorios", icon: BarChart3, label: "Relatórios" },
  { href: "/dashboard/coordenador?tab=ranking", icon: Trophy, label: "Ranking" },
];

const adminLinks = [
  { href: "/dashboard/admin", icon: LayoutDashboard, label: "Visão Geral" },
  { href: "/dashboard/admin?tab=usuarios", icon: Users, label: "Usuários" },
  { href: "/dashboard/admin?tab=config", icon: Settings, label: "Ajustes" },
  { href: "/dashboard/admin?tab=logs", icon: BarChart3, label: "Registros" },
];

const roleIcon: Record<string, React.ElementType> = {
  professor: GraduationCap,
  coordenador: ClipboardCheck,
  admin: ShieldCheck,
};
const roleLabel: Record<string, string> = {
  professor: "Professor(a)",
  coordenador: "Coordenador(a)",
  admin: "Administrador(a)",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, darkMode, toggleDarkMode } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf6f1] dark:bg-[#12121e]">
        <div className="w-8 h-8 border-2 border-[#1a1a2e] dark:border-[#e8e4de] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const links = user.tipo === "professor" ? professorLinks : user.tipo === "coordenador" ? coordenadorLinks : adminLinks;
  const RoleIcon = roleIcon[user.tipo] || GraduationCap;

  const notifs = [
    { text: "Plano de Equações foi aprovado", time: "2 horas atrás", unread: true },
    { text: "Novo comentário no plano #ABC123", time: "1 dia atrás", unread: true },
    { text: "Você subiu para 2º no ranking!", time: "2 dias atrás", unread: false },
  ];

  return (
    <div className="min-h-screen bg-[#faf6f1] dark:bg-[#12121e]">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      <aside className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-[#16161f] border-r border-[#e0d8cc]/50 dark:border-[#2a2a3e]/50 z-50 shadow-2xl shadow-black/5 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b border-[#e0d8cc]/50 dark:border-[#2a2a3e]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1a1a2e] dark:bg-[#e8e4de] flex items-center justify-center">
              <span className="text-white dark:text-[#1a1a2e] font-serif text-lg">✦</span>
            </div>
            <div>
              <h2 className="font-serif text-lg text-[#1a1a2e] dark:text-[#e8e4de]">EduPlan</h2>
              <p className="text-[10px] uppercase tracking-widest text-[#8a8a9e]">Manager</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href.includes("?") && pathname === link.href.split("?")[0]);
            return (
              <Link key={link.href} href={link.href} onClick={() => setSidebarOpen(false)}
                className={isActive ? "sidebar-link-active" : "sidebar-link"}>
                <link.icon className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#e0d8cc]/50 dark:border-[#2a2a3e]/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f0ece6] dark:bg-[#1e1e2e] mb-2">
            <div className="w-9 h-9 rounded-lg bg-[#1a1a2e] dark:bg-[#e8e4de] flex items-center justify-center text-white dark:text-[#1a1a2e] font-bold text-sm">
              {user.nome?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1a1a2e] dark:text-[#e8e4de] truncate">{user.nome}</p>
              <p className="text-[11px] text-[#8a8a9e]">{roleLabel[user.tipo]} · Nv.{user.nivel}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-link w-full text-[#e8614a] hover:text-[#d8513a] hover:bg-[#e8614a]/5 text-sm">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </aside>

      <div className="lg:pl-64 min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#16161f]/80 backdrop-blur-lg border-b border-[#e0d8cc]/30 dark:border-[#2a2a3e]/30">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16 gap-2">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-[#f0ece6] dark:hover:bg-[#1e1e2e] text-[#6a6a7e] dark:text-[#9a9aae] transition-colors flex-shrink-0" aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}>
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              {mobileSearch ? (
                <div className="flex items-center gap-2 flex-1 sm:hidden">
                  <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6a6a7e]" aria-hidden="true" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar..." autoFocus className="w-full pl-9 pr-4 py-2 bg-[#f0ece6] dark:bg-[#1e1e2e] rounded-lg text-sm focus:ring-2 focus:ring-[#0d7377] outline-none text-[#1a1a2e] dark:text-[#e8e4de] placeholder:text-[#8a8a9e]" />
                  </div>
                  <button onClick={() => { setMobileSearch(false); setSearchQuery(""); }} className="p-2 text-[#8a8a9e]" aria-label="Fechar busca"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="relative hidden sm:block flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8a9e]" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar..." className="w-full pl-9 pr-4 py-2 bg-[#f0ece6] dark:bg-[#1e1e2e] rounded-lg text-sm focus:ring-2 focus:ring-[#0d7377] outline-none text-[#1a1a2e] dark:text-[#e8e4de] placeholder:text-[#8a8a9e]" />
                </div>
              )}
              <button onClick={() => setMobileSearch(true)} className="sm:hidden p-2 rounded-lg hover:bg-[#f0ece6] dark:hover:bg-[#1e1e2e] text-[#6a6a7e] dark:text-[#9a9aae] transition-colors flex-shrink-0" aria-label="Abrir busca">
                <Search className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => toggleDarkMode()} className="p-2 rounded-lg hover:bg-[#f0ece6] dark:hover:bg-[#1e1e2e] text-[#6a6a7e] dark:text-[#9a9aae] transition-colors" aria-label={darkMode ? "Modo claro" : "Modo escuro"}>
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <div className="relative">
                <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-lg hover:bg-[#f0ece6] dark:hover:bg-[#1e1e2e] text-[#6a6a7e] dark:text-[#9a9aae] transition-colors" aria-label="Notificações">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#e8614a] rounded-full" />
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#16161f] rounded-xl shadow-2xl border border-[#e0d8cc]/50 dark:border-[#2a2a3e]/50 overflow-hidden z-50">
                      <div className="p-3 border-b border-[#e0d8cc]/30 dark:border-[#2a2a3e]/30">
                        <p className="text-sm font-medium text-[#1a1a2e] dark:text-[#e8e4de]">Notificações</p>
                      </div>
                      {notifs.map((n, i) => (
                        <div key={i} className={`p-3 border-b border-[#e0d8cc]/30 dark:border-[#2a2a3e]/30 last:border-0 ${n.unread ? "bg-[#f0ece6]/50 dark:bg-[#1e1e2e]/50" : ""}`}>
                          <div className="flex items-start gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${n.unread ? "bg-[#0d7377]" : "bg-transparent"}`} />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-[#1a1a2e] dark:text-[#e8e4de]">{n.text}</p>
                              <p className="text-[10px] text-[#8a8a9e] mt-0.5">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
                <div className="flex items-center gap-3 pl-3 ml-2 border-l border-[#e0d8cc]/50 dark:border-[#2a2a3e]/50">
                <button onClick={() => setProfileOpen(true)} className="text-right hidden sm:block cursor-pointer">
                  <p className="text-sm font-medium text-[#1a1a2e] dark:text-[#e8e4de] hover:text-[#0d7377] transition-colors">{user.nome}</p>
                  <p className="text-[11px] text-[#8a8a9e] flex items-center gap-1">
                    <RoleIcon className="w-3 h-3" /> {roleLabel[user.tipo]}
                  </p>
                </button>
                <button onClick={() => setProfileOpen(true)} className="w-9 h-9 rounded-lg bg-[#1a1a2e] dark:bg-[#e8e4de] flex items-center justify-center text-white dark:text-[#1a1a2e] text-sm font-bold flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" aria-label="Perfil do usuário">
                  {user.nome?.charAt(0).toUpperCase()}
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}
