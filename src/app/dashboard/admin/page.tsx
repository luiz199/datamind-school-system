"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import {
  Users, Settings, BarChart3, Shield, UserPlus, Trash2,
  Search, Download, Activity, Clock, Server, X, Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import { getPlanos, getLogs, getConfig, saveConfig, getUsers, type SystemConfig } from "@/lib/storage";
import { api } from "@/lib/api";
import StatCard from "@/components/StatCard";
import { CardSkeleton } from "@/components/Skeleton";

export default function AdminDashboard() {
  const { user: authUser } = useAuth();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";
  const [search, setSearch] = useState("");
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [planos, setPlanos] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [config, setConfigState] = useState<SystemConfig>({
    nome: "EduPlan Manager", pontosEnvio: 10, pontosAprovacao: 20, bonusDestaque: 50, manutencao: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [u, p, l, c] = await Promise.all([getUsers(), getPlanos(), getLogs(), getConfig()]);
      setUsuarios(u); setPlanos(p); setLogs(l); setConfigState(c);
      setLoading(false);
    })();
  }, []);

  /* ── Modal state ── */
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [modalNome, setModalNome] = useState("");
  const [modalEmail, setModalEmail] = useState("");
  const [modalSenha, setModalSenha] = useState("");
  const [modalTipo, setModalTipo] = useState<"professor" | "coordenador" | "admin">("professor");

  const total = usuarios.length;
  const profCount = usuarios.filter((u) => u.tipo === "professor").length;
  const coordCount = usuarios.filter((u) => u.tipo === "coordenador").length;
  const planosTotal = planos.length;

  const profPercent = total ? Math.round((profCount / total) * 100) : 0;
  const coordPercent = total ? Math.round((coordCount / total) * 100) : 0;
  const adminCount = total - profCount - coordCount;
  const adminPercent = total ? Math.round((adminCount / total) * 100) : 0;

  const stats = [
    { label: "Total de Usuários", value: String(total), icon: Users, color: "text-[#0d7377]" },
    { label: "Professores", value: String(profCount), icon: Users, color: "text-[#5a7a5a]" },
    { label: "Coordenadores", value: String(coordCount), icon: Shield, color: "text-[#8b5cf6]" },
    { label: "Planos Totais", value: String(planosTotal), icon: BarChart3, color: "text-[#e8a838]" },
  ];

  /* ── User CRUD ── */
  const handleDeleteUser = useCallback(async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${nome}"?`)) return;
    try {
      await api.users.delete(id);
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
      toast.success(`"${nome}" foi removido(a)`);
    } catch { toast.error("Erro ao excluir"); }
  }, []);

  const openNewModal = () => {
    setEditId(null); setModalNome(""); setModalEmail(""); setModalSenha(""); setModalTipo("professor");
    setModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!modalNome || !modalEmail || !modalSenha) { toast.error("Preencha todos os campos"); return; }
    try {
      if (editId) {
        await api.users.update(editId, { nome: modalNome, email: modalEmail, password: modalSenha, tipo: modalTipo });
      } else {
        if (usuarios.find((u) => u.email === modalEmail)) { toast.error("Email já cadastrado"); return; }
        await api.users.create({ nome: modalNome, email: modalEmail, password: modalSenha, tipo: modalTipo });
      }
      setUsuarios(await getUsers());
      setModalOpen(false);
      toast.success(editId ? "Usuário atualizado!" : "Usuário criado!");
    } catch { toast.error("Erro ao salvar usuário"); }
  };

  /* ── Config ── */
  const handleConfigChange = async (key: keyof SystemConfig, value: string | boolean) => {
    const next = { ...config, [key]: value };
    setConfigState(next);
    await saveConfig(next);
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl text-[#1a1a2e] dark:text-[#e8e4de]">Painel Administrativo</h1>
        <p className="text-[#8a8a9e] text-sm mt-1">Controle total do sistema</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          stats.map((stat, i) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} color={stat.color} delay={i * 0.08} />
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="paper-card p-6">
          <h3 className="text-lg text-[#1a1a2e] dark:text-[#e8e4de] mb-4">Distribuição de Usuários</h3>
          <div className="space-y-4">
            {[
              { tipo: "Professores", count: profCount, color: "bg-[#0d7377]", percent: profPercent },
              { tipo: "Coordenadores", count: coordCount, color: "bg-[#8b5cf6]", percent: coordPercent },
              { tipo: "Administradores", count: adminCount, color: "bg-[#e8a838]", percent: adminPercent },
            ].filter((i) => i.count > 0).map((item) => (
              <div key={item.tipo}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#5a5a6e] dark:text-[#9a9aae]">{item.tipo}</span>
                  <span className="text-[#8a8a9e]">{item.count} ({item.percent}%)</span>
                </div>
                <div className="w-full bg-[#e8e0d6] dark:bg-[#2a2a3e] rounded-full h-2.5 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${item.percent}%` }} transition={{ duration: 1, ease: "easeOut" }} className={`h-full rounded-full ${item.color}`} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="paper-card p-6">
          <h3 className="text-lg text-[#1a1a2e] dark:text-[#e8e4de] mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0d7377]" /> Atividade Recente
          </h3>
          <div className="space-y-3">
            {logs.slice(0, 4).length === 0 ? (
              <p className="text-sm text-[#8a8a9e] text-center py-4">Nenhuma atividade registrada</p>
            ) : (
              logs.slice(0, 4).map((log, i) => (
                <div key={log.id || i} className="flex items-start gap-3 p-2">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-[#5a7a5a] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1a1a2e] dark:text-[#e8e4de] truncate">{log.acao}</p>
                    <p className="text-xs text-[#8a8a9e]">{log.usuarioNome} · {new Date(log.createdAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="paper-card p-6">
        <h3 className="text-lg text-[#1a1a2e] dark:text-[#e8e4de] mb-4">Sistema</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Server, label: "Versão", value: "1.0.0" },
            { icon: Clock, label: "Usuários", value: String(total) },
            { icon: Shield, label: "Planos", value: String(planosTotal) },
            { icon: BarChart3, label: "Armazenamento", value: "MongoDB" },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-xl bg-[#f0ece6] dark:bg-[#1e1e2e] text-center">
              <item.icon className="w-5 h-5 text-[#0d7377] mx-auto mb-2" />
              <p className="text-xs text-[#8a8a9e]">{item.label}</p>
              <p className="font-medium text-sm text-[#1a1a2e] dark:text-[#e8e4de]">{item.value}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderUsuarios = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl text-[#1a1a2e] dark:text-[#e8e4de]">Gerenciar Usuários</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8a9e]" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9 py-2 text-sm w-full sm:w-56" placeholder="Buscar..." />
          </div>
          <button onClick={openNewModal} className="btn-primary text-sm"><UserPlus className="w-4 h-4" /> Novo</button>
        </div>
      </div>

      <div className="paper-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#8a8a9e] bg-[#f0ece6]/50 dark:bg-[#1e1e2e]/50">
                <th className="p-4 font-medium">Nome</th>
                <th className="p-4 font-medium hidden sm:table-cell">Email</th>
                <th className="p-4 font-medium">Tipo</th>
                <th className="p-4 font-medium hidden md:table-cell">Pontos</th>
                <th className="p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.filter((u) => u.nome.toLowerCase().includes(search.toLowerCase())).map((u) => (
                <tr key={u.id} className="border-b border-[#e0d8cc]/30 dark:border-[#2a2a3e]/30 hover:bg-[#f0ece6]/30 dark:hover:bg-[#1e1e2e]/30 transition-colors">
                  <td className="p-4 font-medium text-[#1a1a2e] dark:text-[#e8e4de]">{u.nome}</td>
                  <td className="p-4 text-[#8a8a9e] hidden sm:table-cell">{u.email}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                      u.tipo === "admin" ? "bg-[#fef3c7] dark:bg-[#3a3000] text-[#b8860b] dark:text-[#fbbf24] border border-[#fde68a] dark:border-[#5a5000]" :
                      u.tipo === "coordenador" ? "bg-[#e3f2fd] dark:bg-[#0a2a3a] text-[#0d7377] dark:text-[#4dd0e1] border border-[#bbdefb] dark:border-[#0a4a5a]" :
                      "bg-[#dcedc8] dark:bg-[#1a3a1a] text-[#2e7d32] dark:text-[#81c784] border border-[#c5e1a5] dark:border-[#2a5a2a]"
                    }`}>
                      {u.tipo === "admin" ? "Admin" : u.tipo === "coordenador" ? "Coord." : "Prof."}
                    </span>
                  </td>
                  <td className="p-4 font-serif text-[#0d7377] hidden md:table-cell">{u.pontuacao}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleDeleteUser(u.id, u.nome)} className="p-3 rounded-lg hover:bg-[#f0ece6] dark:hover:bg-[#1e1e2e] text-[#e8614a] transition-colors" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white dark:bg-[#16161f] rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg text-[#1a1a2e] dark:text-[#e8e4de]">{editId ? "Editar Usuário" : "Novo Usuário"}</h3>
                <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-[#f0ece6] dark:hover:bg-[#1e1e2e] text-[#8a8a9e]"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#5a5a6e] dark:text-[#9a9aae] block mb-1">Nome</label>
                  <input type="text" value={modalNome} onChange={(e) => setModalNome(e.target.value)} className="input-field text-sm" placeholder="Nome completo" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#5a5a6e] dark:text-[#9a9aae] block mb-1">Email</label>
                  <input type="email" value={modalEmail} onChange={(e) => setModalEmail(e.target.value)} className="input-field text-sm" placeholder="email@exemplo.com" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#5a5a6e] dark:text-[#9a9aae] block mb-1">Senha</label>
                  <input type="password" value={modalSenha} onChange={(e) => setModalSenha(e.target.value)} className="input-field text-sm" placeholder="••••••••" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#5a5a6e] dark:text-[#9a9aae] block mb-1">Tipo</label>
                  <select value={modalTipo} onChange={(e) => setModalTipo(e.target.value as any)} className="select-field text-sm">
                    <option value="professor">Professor</option>
                    <option value="coordenador">Coordenador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <button onClick={handleSaveUser} className="btn-primary w-full"><Plus className="w-4 h-4" /> {editId ? "Atualizar" : "Criar"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderConfig = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl text-[#1a1a2e] dark:text-[#e8e4de]">Ajustes do Sistema</h2>
      <div className="paper-card p-6 space-y-6">
        {([
          { label: "Nome do Sistema", key: "nome" as const, type: "text" },
          { label: "Pontos por Envio", key: "pontosEnvio" as const, type: "number" },
          { label: "Pontos por Aprovação", key: "pontosAprovacao" as const, type: "number" },
          { label: "Bônus Destaque", key: "bonusDestaque" as const, type: "number" },
        ] as const).map((item) => (
          <div key={item.key} className="flex items-center justify-between pb-4 border-b border-[#e0d8cc]/30 dark:border-[#2a2a3e]/30 last:border-0 last:pb-0 gap-4 flex-wrap">
            <div className="min-w-0">
              <h3 className="font-medium text-sm text-[#1a1a2e] dark:text-[#e8e4de]">{item.label}</h3>
            </div>
            <input type={item.type} className="input-field w-24 py-2 text-sm text-center flex-shrink-0"
              value={String(config[item.key])} onChange={(e) => handleConfigChange(item.key, e.target.value)} />
          </div>
        ))}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-medium text-sm text-[#1a1a2e] dark:text-[#e8e4de]">Modo de Manutenção</h3>
            <p className="text-xs text-[#8a8a9e]">Desabilitar acesso de usuários</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input type="checkbox" className="sr-only peer" checked={config.manutencao} onChange={(e) => handleConfigChange("manutencao", e.target.checked)} />
            <div className="w-10 h-5 bg-[#e0d8cc] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0d7377] rounded-full peer dark:bg-[#2a2a3e] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-[#0d7377]" />
          </label>
        </div>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl text-[#1a1a2e] dark:text-[#e8e4de]">Registros</h2>
        <button onClick={() => {
          const text = logs.map((l) => `${l.usuarioNome} | ${l.acao} | ${new Date(l.createdAt).toLocaleString("pt-BR")}`).join("\n");
          navigator.clipboard.writeText(text);
          toast.success("Logs copiados!");
        }} className="btn-secondary text-sm"><Download className="w-4 h-4" /> Exportar</button>
      </div>
      <div className="paper-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#8a8a9e] bg-[#f0ece6]/50 dark:bg-[#1e1e2e]/50">
                <th className="p-4 font-medium">Usuário</th>
                <th className="p-4 font-medium">Ação</th>
                <th className="p-4 font-medium hidden sm:table-cell">Data</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={3} className="p-8 text-center text-[#8a8a9e]">Nenhum registro ainda</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-[#e0d8cc]/30 dark:border-[#2a2a3e]/30 hover:bg-[#f0ece6]/30 dark:hover:bg-[#1e1e2e]/30">
                    <td className="p-4 font-medium text-[#1a1a2e] dark:text-[#e8e4de]">{log.usuarioNome}</td>
                    <td className="p-4 text-[#8a8a9e]">{log.acao}</td>
                    <td className="p-4 text-[#8a8a9e] hidden sm:table-cell">{new Date(log.createdAt).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {tab === "dashboard" && renderDashboard()}
      {tab === "usuarios" && renderUsuarios()}
      {tab === "config" && renderConfig()}
      {tab === "logs" && renderLogs()}
    </>
  );
}
