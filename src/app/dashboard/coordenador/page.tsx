"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import { MATERIAS, PlanoAula } from "@/types";
import { formatDate } from "@/lib/utils";
import { getPlanos, updatePlanoStatus, addLog, getUsers, getLogs, saveUsers, getConfig } from "@/lib/storage";
import StatCard from "@/components/StatCard";
import { CardSkeleton } from "@/components/Skeleton";
import {
  BarChart3, Trophy, Search, CheckCircle,
  XCircle, Users, BookOpen, Clock, AlertCircle, Sparkles, Activity, Download, BookCheck, FileSpreadsheet,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import toast from "react-hot-toast";
import Confetti from "@/components/Confetti";

const COLORS = ["#0d7377", "#5a7a5a", "#e8a838", "#e8614a", "#8b5cf6"];

export default function CoordenadorDashboard() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";
  const [search, setSearch] = useState("");
  const [filterMateria, setFilterMateria] = useState("");
  const [planos, setPlanos] = useState<PlanoAula[]>([]);
  const [professores, setProfessores] = useState<any[]>([]);
  const [logsList, setLogsList] = useState<any[]>([]);
  const [comentarios, setComentarios] = useState<Record<string, string>>({});
  const [notas, setNotas] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    (async () => {
      const [p, u, c] = await Promise.all([getPlanos(), getUsers(), getConfig()]);
      setPlanos(p);
      setProfessores(u.filter((u: any) => u.tipo === "professor"));
      setConfig(c);
      setLoading(false);
    })();
  }, []);
  useEffect(() => { (async () => { setLogsList(await getLogs()); })(); }, [planos]);

  const pendentes = planos.filter((p) => p.status === "pendente");
  const aprovados = planos.filter((p) => p.status === "aprovado");
  const correcao = planos.filter((p) => p.status === "correcao");
  const reprovados = planos.filter((p) => p.status === "reprovado");

  const stats = [
    { label: "Total de Planos", value: String(planos.length), icon: BookOpen, color: "text-[#0d7377]" },
    { label: "Aprovados", value: String(aprovados.length), icon: CheckCircle, color: "text-[#5a7a5a]" },
    { label: "Pendentes", value: String(pendentes.length), icon: Clock, color: "text-[#e8a838]" },
    { label: "Professores", value: String(professores.length), icon: Users, color: "text-[#8b5cf6]" },
  ];

  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const chartData = meses.map((mes, i) => {
    const enviados = planos.filter((p) => new Date(p.createdAt).getMonth() === i).length;
    const aprovadosMes = planos.filter((p) => new Date(p.createdAt).getMonth() === i && p.status === "aprovado").length;
    return { mes, enviados, aprovados: aprovadosMes };
  });

  const total = planos.length || 1;
  const pieData = [
    { name: "Aprovados", value: aprovados.length, color: "#5a7a5a" },
    { name: "Pendentes", value: pendentes.length, color: "#e8a838" },
    { name: "Correção", value: correcao.length, color: "#0d7377" },
    { name: "Reprovados", value: reprovados.length, color: "#e8614a" },
  ].filter((d) => d.value > 0);

  const materiaMap = new Map<string, number>();
  planos.forEach((p) => materiaMap.set(p.materia, (materiaMap.get(p.materia) || 0) + 1));
  const maxMateria = Math.max(...Array.from(materiaMap.values()), 1);
  const materiasCount = Array.from(materiaMap.entries()).map(([materia, count], i) => ({
    materia, count, color: COLORS[i % COLORS.length],
  }));

  const profStats = professores.map((prof) => {
    const profPlanos = planos.filter((p) => p.professorId === prof.id);
    const profAprovados = profPlanos.filter((p) => p.status === "aprovado").length;
    const notaMedia = profPlanos.reduce((acc, p) => acc + (p.nota || 0), 0) / (profPlanos.length || 1);
    return { nome: prof.nome, planos: profPlanos.length, aprovados: profAprovados, nota: Math.round(notaMedia * 10) / 10 };
  }).sort((a, b) => b.planos - a.planos).slice(0, 5);

  const ranking = [...professores].sort((a, b) => b.pontuacao - a.pontuacao).slice(0, 5);

  const handleAction = async (planoId: string, status: PlanoAula["status"]) => {
    const labels: Record<string, string> = { aprovado: "aprovar", correcao: "enviar para correção", reprovado: "reprovar" };
    if (!confirm(`Tem certeza que deseja ${labels[status]} este plano?`)) return;

    const nota = notas[planoId] ? parseFloat(notas[planoId]) : undefined;
    const maxPts = Math.max(...planos.filter((p) => p.status === "aprovado" || status === "aprovado").map((p) => p.nota || 0), 10);
    const ptsAprovacao = config?.pontosAprovacao || 20;
    const pontos = status === "aprovado" ? Math.round((nota || maxPts) * (ptsAprovacao / 10)) : 0;

    await updatePlanoStatus(planoId, status, nota);

    if (user) {
      await addLog({
        id: crypto.randomUUID(),
        usuarioId: user.id,
        usuarioNome: user.nome,
        acao: `${status === "aprovado" ? "Aprovou" : status === "correcao" ? "Pediu correção de" : "Reprovou"} plano`,
        detalhes: `Plano ID: ${planoId}`,
        createdAt: new Date(),
      });
    }

    if (status === "aprovado" && pontos > 0) {
      const plano = planos.find((p) => p.id === planoId);
      if (plano) {
        const users = await getUsers();
        const profIdx = users.findIndex((u: any) => u.id === plano.professorId);
        if (profIdx !== -1) {
          users[profIdx].pontuacao += pontos;
          users[profIdx].nivel = Math.min(Math.floor(users[profIdx].pontuacao / 100) + 1, 10);
          await import("@/lib/storage").then((m) => m.saveUsers(users));
        }
        await import("@/lib/storage").then((m) => m.createNotification({
          usuarioId: plano.professorId,
          tipo: status,
          titulo: status === "aprovado" ? "Plano aprovado!" : status === "correcao" ? "Ajustes solicitados" : "Plano recusado",
          mensagem: `Seu plano "${plano.tema}" foi ${status === "aprovado" ? "aprovado" : status === "correcao" ? "enviado para correção" : "recusado"}${nota ? ` com nota ${nota}` : ""}.`,
        }));
      }
    }

    setPlanos(await getPlanos());
    const label = status === "aprovado" ? "aprovado" : status === "correcao" ? "enviado para correção" : "reprovado";
    if (status === "aprovado") setConfetti(true);
    toast.success(`Plano ${label} com sucesso!`);
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl text-[#1a1a2e] dark:text-[#e8e4de]">Painel do Coordenador</h1>
        <p className="text-[#8a8a9e] text-sm mt-1">Visão geral dos planos de aula</p>
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
          <h3 className="text-lg text-[#1a1a2e] dark:text-[#e8e4de] mb-4">Planos por Mês</h3>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0d8cc" strokeOpacity={0.5} />
                <XAxis dataKey="mes" stroke="#8a8a9e" fontSize={12} />
                <YAxis stroke="#8a8a9e" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e0d8cc", background: "#fff" }} />
                <Line type="monotone" dataKey="enviados" stroke="#0d7377" strokeWidth={2} dot={{ fill: "#0d7377" }} name="Enviados" />
                <Line type="monotone" dataKey="aprovados" stroke="#5a7a5a" strokeWidth={2} dot={{ fill: "#5a7a5a" }} name="Aprovados" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="paper-card p-6">
          <h3 className="text-lg text-[#1a1a2e] dark:text-[#e8e4de] mb-4">Status dos Planos</h3>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 flex-wrap mt-2">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[#8a8a9e]">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="paper-card p-6">
        <h3 className="text-lg text-[#1a1a2e] dark:text-[#e8e4de] mb-4">Matérias com Mais Envios</h3>
        <div className="space-y-3">
          {materiasCount.length === 0 ? (
            <p className="text-sm text-[#8a8a9e] py-4 text-center">Nenhum plano ainda</p>
          ) : (
            materiasCount.map((m) => (
              <div key={m.materia} className="flex items-center gap-3">
                <span className="w-24 sm:w-28 text-sm font-medium text-[#5a5a6e] dark:text-[#9a9aae] flex-shrink-0">{m.materia}</span>
                <div className="flex-1 bg-[#e8e0d6] dark:bg-[#2a2a3e] rounded-full h-3 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(m.count / maxMateria) * 100}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full rounded-full" style={{ backgroundColor: m.color }} />
                </div>
                <span className="text-sm font-serif text-[#1a1a2e] dark:text-[#e8e4de] w-6 text-right">{m.count}</span>
              </div>
            ))
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="paper-card p-6">
        <h3 className="text-lg text-[#1a1a2e] dark:text-[#e8e4de] mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#e8a838]" /> Professores em Destaque
        </h3>
        {profStats.length === 0 ? (
          <p className="text-sm text-[#8a8a9e] py-4 text-center">Nenhum professor com planos</p>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <div className="inline-block min-w-full px-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#8a8a9e] border-b border-[#e0d8cc]/50 dark:border-[#2a2a3e]/50">
                    <th className="pb-3 font-medium pr-4">Professor</th>
                    <th className="pb-3 font-medium pr-4">Planos</th>
                    <th className="pb-3 font-medium pr-4">Aprovados</th>
                    <th className="pb-3 font-medium pr-4">Aproveitamento</th>
                    <th className="pb-3 font-medium">Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {profStats.map((prof, i) => (
                    <tr key={i} className="border-b border-[#e0d8cc]/30 dark:border-[#2a2a3e]/30">
                      <td className="py-3 pr-4 font-medium text-[#1a1a2e] dark:text-[#e8e4de]">{prof.nome}</td>
                      <td className="py-3 pr-4 text-[#8a8a9e]">{prof.planos}</td>
                      <td className="py-3 pr-4 text-[#8a8a9e]">{prof.aprovados}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 sm:w-20 bg-[#e8e0d6] dark:bg-[#2a2a3e] rounded-full h-1.5">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${prof.planos > 0 ? (prof.aprovados / prof.planos) * 100 : 0}%` }} transition={{ duration: 1 }} className="h-full bg-[#5a7a5a] rounded-full" />
                          </div>
                          <span className="text-xs text-[#8a8a9e]">{prof.planos > 0 ? Math.round((prof.aprovados / prof.planos) * 100) : 0}%</span>
                        </div>
                      </td>
                      <td className="py-3 font-serif text-[#0d7377]">{prof.nota}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="paper-card p-6">
        <h3 className="text-lg text-[#1a1a2e] dark:text-[#e8e4de] mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#0d7377]" /> Atividades Recentes
        </h3>
        <div className="space-y-3">
          {logsList.slice(0, 5).length === 0 ? (
            <p className="text-sm text-[#8a8a9e] text-center py-4">Nenhuma atividade registrada</p>
          ) : (
            logsList.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-2">
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
  );

  const renderPlanos = () => {
    const filtered = planos.filter((p) => p.status === "pendente" || p.status === "correcao")
      .filter((p) => !filterMateria || p.materia === filterMateria)
      .filter((p) => p.tema.toLowerCase().includes(search.toLowerCase()) || p.professorNome.toLowerCase().includes(search.toLowerCase()));

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl text-[#1a1a2e] dark:text-[#e8e4de]">Revisar Planos</h2>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8a9e]" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9 py-2 text-sm w-full sm:w-56" placeholder="Buscar planos..." />
            </div>
            <select value={filterMateria} onChange={(e) => setFilterMateria(e.target.value)} className="select-field py-2 text-sm w-36">
              <option value="">Todas</option>
              {MATERIAS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="paper-card p-12 text-center">
            <CheckCircle className="w-10 h-10 text-[#5a7a5a] mx-auto mb-3" />
            <p className="text-[#8a8a9e]">Nenhum plano pendente ou em correção</p>
          </div>
        ) : (
          filtered.map((plano, i) => (
            <motion.div key={plano.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="paper-card p-6">
              <div className="flex flex-col gap-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-lg text-[#1a1a2e] dark:text-[#e8e4de]">{plano.tema}</h3>
                        <span className={plano.status === "pendente" ? "badge-pendente" : "badge-correcao"}>
                          {plano.status === "pendente" ? "Pendente" : "Correção"}
                        </span>
                      </div>
                      <p className="text-sm text-[#8a8a9e]">{plano.professorNome} · {plano.materia} · {plano.serie} · Turma {plano.turma}</p>
                    </div>
                    <span className="text-xs text-[#8a8a9e] flex-shrink-0">{formatDate(plano.createdAt)}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-xl bg-[#f0ece6] dark:bg-[#1e1e2e]">
                      <p className="font-medium text-[#5a5a6e] dark:text-[#9a9aae] mb-1 text-xs uppercase tracking-wider">Objetivos</p>
                      <p className="text-[#6a6a7e] dark:text-[#aaaaae]">{plano.objetivos}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#f0ece6] dark:bg-[#1e1e2e]">
                      <p className="font-medium text-[#5a5a6e] dark:text-[#9a9aae] mb-1 text-xs uppercase tracking-wider">Conteúdo</p>
                      <p className="text-[#6a6a7e] dark:text-[#aaaaae]">{plano.conteudo}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#f0ece6] dark:bg-[#1e1e2e]">
                      <p className="font-medium text-[#5a5a6e] dark:text-[#9a9aae] mb-1 text-xs uppercase tracking-wider">Metodologia</p>
                      <p className="text-[#6a6a7e] dark:text-[#aaaaae]">{plano.metodologia}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#f0ece6] dark:bg-[#1e1e2e]">
                      <p className="font-medium text-[#5a5a6e] dark:text-[#9a9aae] mb-1 text-xs uppercase tracking-wider">Recursos</p>
                      <p className="text-[#6a6a7e] dark:text-[#aaaaae]">{plano.recursos}</p>
                    </div>
                  </div>

                  {plano.arquivoNome && (
                    <a href={`/api/planos/${plano.id}/arquivo`} download={plano.arquivoNome}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0d7377]/10 text-[#0d7377] hover:bg-[#0d7377]/20 text-sm font-medium transition-colors">
                      <Download className="w-4 h-4" /> Baixar {plano.arquivoNome}
                    </a>
                  )}

                  <div className="space-y-3">
                    <textarea className="textarea-field text-sm h-20" placeholder="Escreva seu comentário sobre este plano..."
                      value={comentarios[plano.id] || ""} onChange={(e) => setComentarios({ ...comentarios, [plano.id]: e.target.value })} />
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <input type="number" min="0" max="10" step="0.5" className="input-field w-20 py-2 text-sm text-center"
                          placeholder="Nota" value={notas[plano.id] || ""} onChange={(e) => setNotas({ ...notas, [plano.id]: e.target.value })} />
                        <span className="text-sm text-[#8a8a9e]">/10</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button onClick={() => handleAction(plano.id, "aprovado")} className="btn-success"><CheckCircle className="w-4 h-4" /> Aprovar</button>
                    <button onClick={() => handleAction(plano.id, "correcao")} className="btn-warning"><AlertCircle className="w-4 h-4" /> Correção</button>
                    <button onClick={() => handleAction(plano.id, "reprovado")} className="btn-danger"><XCircle className="w-4 h-4" /> Reprovar</button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    );
  };

  const exportCSV = () => {
    const header = "Protocolo,Tema,Professor,Matéria,Série,Turma,Status,Nota,Data\n";
    const rows = planos.map((p) =>
      `"${p.protocolo}","${p.tema}","${p.professorNome}","${p.materia}","${p.serie}","${p.turma}","${p.status}","${p.nota || ""}","${new Date(p.createdAt).toLocaleDateString("pt-BR")}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `planos-${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const renderRelatorios = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl text-[#1a1a2e] dark:text-[#e8e4de]">Relatórios</h2>
        <button onClick={exportCSV} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5a7a5a]/10 text-[#5a7a5a] hover:bg-[#5a7a5a]/20 text-sm font-medium transition-colors">
          <FileSpreadsheet className="w-4 h-4" /> Exportar CSV
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="paper-card p-6">
          <h3 className="text-lg text-[#1a1a2e] dark:text-[#e8e4de] mb-4">Planos por Matéria</h3>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={materiasCount}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0d8cc" strokeOpacity={0.5} />
                <XAxis dataKey="materia" stroke="#8a8a9e" fontSize={12} />
                <YAxis stroke="#8a8a9e" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e0d8cc" }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {materiasCount.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="paper-card p-6">
          <h3 className="text-lg text-[#1a1a2e] dark:text-[#e8e4de] mb-4">Desempenho Mensal</h3>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0d8cc" strokeOpacity={0.5} />
                <XAxis dataKey="mes" stroke="#8a8a9e" fontSize={12} />
                <YAxis stroke="#8a8a9e" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e0d8cc" }} />
                <Line type="monotone" dataKey="enviados" stroke="#0d7377" strokeWidth={2} name="Enviados" />
                <Line type="monotone" dataKey="aprovados" stroke="#5a7a5a" strokeWidth={2} name="Aprovados" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderAulasAprovadas = () => {
    const aprovados = planos.filter((p) => p.status === "aprovado");

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl text-[#1a1a2e] dark:text-[#e8e4de]">Aulas Aprovadas</h2>
          <span className="text-sm text-[#8a8a9e]">{aprovados.length} plano(s)</span>
        </div>

        {aprovados.length === 0 ? (
          <div className="paper-card p-12 text-center">
            <BookCheck className="w-10 h-10 text-[#d0c8bc] mx-auto mb-3" />
            <p className="text-[#8a8a9e]">Nenhum plano aprovado ainda</p>
          </div>
        ) : (
          aprovados.map((plano, i) => (
            <motion.div key={plano.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="paper-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-lg text-[#1a1a2e] dark:text-[#e8e4de]">{plano.tema}</h3>
                  <p className="text-sm text-[#8a8a9e]">{plano.professorNome} · {plano.materia} · {plano.serie} · Turma {plano.turma}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="badge-aprovado"><CheckCircle className="w-3 h-3 mr-1" /> Aprovado</span>
                  {plano.nota && <span className="text-sm font-serif text-[#0d7377]">{plano.nota}</span>}
                </div>
              </div>

              <p className="text-sm text-[#6a6a7e] dark:text-[#aaaaae] line-clamp-2 mb-4">{plano.objetivos}</p>

              <div className="flex items-center justify-between text-xs text-[#8a8a9e] pt-3 border-t border-[#e0d8cc]/30 dark:border-[#2a2a3e]/30">
                <span className="font-mono">{plano.protocolo}</span>
                <div className="flex items-center gap-2">
                  {plano.arquivoNome && (
                    <a href={`/api/planos/${plano.id}/arquivo`} download={plano.arquivoNome}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0d7377]/10 text-[#0d7377] hover:bg-[#0d7377]/20 text-xs font-medium transition-colors">
                      <Download className="w-3.5 h-3.5" /> {plano.arquivoNome}
                    </a>
                  )}
                  <span>{formatDate(plano.createdAt)}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    );
  };

  const renderRanking = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="paper-card p-8 text-center">
        <Trophy className="w-12 h-12 text-[#e8a838] mx-auto mb-3" />
        <h2 className="text-2xl text-[#1a1a2e] dark:text-[#e8e4de]">Ranking</h2>
        <p className="text-sm text-[#8a8a9e]">Top professores</p>
      </div>
      {ranking.length === 0 ? (
        <p className="text-center text-[#8a8a9e] py-8">Nenhum professor cadastrado</p>
      ) : (
        ranking.map((prof, i) => (
          <motion.div key={prof.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="paper-card p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
              i <= 2 ? "bg-[#1a1a2e] dark:bg-[#e8e4de] text-white dark:text-[#1a1a2e]" : "bg-[#f0ece6] dark:bg-[#1e1e2e] text-[#8a8a9e]"
            }`}>
              {i <= 2 ? ["🥇", "🥈", "🥉"][i] : i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#1a1a2e] dark:text-[#e8e4de] truncate">{prof.nome}</p>
              <p className="text-xs text-[#8a8a9e]">Nível {prof.nivel} · {prof.pontuacao} pontos</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-serif text-[#1a1a2e] dark:text-[#e8e4de]">{prof.pontuacao}</p>
            </div>
            <div className="w-16 sm:w-20 bg-[#e8e0d6] dark:bg-[#2a2a3e] rounded-full h-1.5 flex-shrink-0 hidden sm:block">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(prof.pontuacao / Math.max(...ranking.map((r) => r.pontuacao), 1)) * 100}%` }} transition={{ duration: 1, delay: i * 0.1 }} className="h-full bg-[#1a1a2e] dark:bg-[#e8e4de] rounded-full" />
            </div>
          </motion.div>
        ))
      )}
    </div>
  );

  return (
    <>
      <Confetti active={confetti} />
      {tab === "dashboard" && renderDashboard()}
      {tab === "planos" && renderPlanos()}
      {tab === "aulas-aprovadas" && renderAulasAprovadas()}
      {tab === "relatorios" && renderRelatorios()}
      {tab === "ranking" && renderRanking()}
    </>
  );
}
