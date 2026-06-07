"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import { MATERIAS, SERIES, TURMAS, PlanoAula, Materia } from "@/types";
import { generateProtocol, formatDate, getNivel } from "@/lib/utils";
import { getPlanos, addPlano, getUsers } from "@/lib/storage";
import StatCard from "@/components/StatCard";
import { CardSkeleton } from "@/components/Skeleton";
import {
  Send, FileText, Trophy, Clock, CheckCircle, AlertCircle,
  Upload, Award, TrendingUp, Sparkles, ArrowRight, CalendarDays, MessageSquareText,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProfessorDashboard() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";
  const [planos, setPlanos] = useState<PlanoAula[]>([]);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [professores, setProfessores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [all, users] = await Promise.all([getPlanos(), getUsers()]);
      setPlanos(all.filter((p) => p.professorId === user?.id));
      setProfessores(users.filter((u: any) => u.tipo === "professor").sort((a: any, b: any) => b.pontuacao - a.pontuacao));
      setLoading(false);
    })();
  }, [user?.id]);

  const nivelInfo = getNivel(user?.pontuacao || 0);
  const progress = user ? Math.min((user.pontuacao / nivelInfo.nextLevel) * 100, 100) : 0;

  const total = planos.length;
  const aprovados = planos.filter((p) => p.status === "aprovado").length;
  const pendentes = planos.filter((p) => p.status === "pendente").length;

  const stats = [
    { label: "Enviados", value: String(total), icon: Send, color: "text-[#0d7377]" },
    { label: "Aprovados", value: String(aprovados), icon: CheckCircle, color: "text-[#5a7a5a]" },
    { label: "Pendentes", value: String(pendentes), icon: Clock, color: "text-[#e8a838]" },
    { label: "Pontuação", value: String(user?.pontuacao || 0), icon: Trophy, color: "text-[#e8614a]" },
  ];

  const [formData, setFormData] = useState({
    materia: "Matemática",
    serie: "6º Ano",
    turma: "A",
    data: new Date().toISOString().split("T")[0],
    tema: "",
    objetivos: "",
    conteudo: "",
    metodologia: "",
    recursos: "",
    avaliacao: "",
    observacoes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tema || !formData.objetivos || !formData.conteudo) {
      toast.error("Preencha tema, objetivos e conteúdo");
      return;
    }
    const novoPlano: PlanoAula = {
      id: crypto.randomUUID(),
      professorId: user?.id || "",
      professorNome: user?.nome || "",
      materia: formData.materia as Materia,
      serie: formData.serie,
      turma: formData.turma,
      data: formData.data,
      tema: formData.tema,
      objetivos: formData.objetivos,
      conteudo: formData.conteudo,
      metodologia: formData.metodologia,
      recursos: formData.recursos,
      avaliacao: formData.avaliacao,
      observacoes: formData.observacoes,
      arquivoNome: arquivo?.name,
      arquivoTipo: arquivo?.type,
      status: "pendente",
      protocolo: generateProtocol(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await addPlano(novoPlano);
    setPlanos((prev) => [novoPlano, ...prev]);
    toast.success(`Plano enviado! Protocolo: ${novoPlano.protocolo}`);
    setFormData({ materia: "Matemática", serie: "6º Ano", turma: "A", data: new Date().toISOString().split("T")[0], tema: "", objetivos: "", conteudo: "", metodologia: "", recursos: "", avaliacao: "", observacoes: "" });
    setArquivo(null);
  };

  const topRanking = professores.slice(0, 4).map((u, i) => ({
    pos: i + 1,
    nome: u.nome,
    pts: u.pontuacao,
    badge: i === 0 ? "★" : i === 1 ? "✦" : i === 2 ? "◆" : "",
    isMe: u.id === user?.id,
  }));
  const myPos = professores.findIndex((u) => u.id === user?.id);
  if (myPos >= 3 && user) {
    topRanking[3] = { pos: myPos + 1, nome: user.nome, pts: user.pontuacao, badge: "", isMe: true };
  }

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-[#1a1a2e] dark:text-[#e8e4de]">Olá, {user?.nome?.split(" ")[0]}!</h1>
          <p className="text-[#8a8a9e] text-sm mt-1">Que tal começar um novo plano hoje?</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-[#8a8a9e] bg-white dark:bg-[#1a1a2e] px-4 py-2 rounded-lg border border-[#e0d8cc]/50 dark:border-[#2a2a3e]/50">
          <CalendarDays className="w-3.5 h-3.5" />
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
        </div>
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
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg text-[#1a1a2e] dark:text-[#e8e4de]">Sua Jornada</h3>
            <Award className="w-5 h-5 text-[#e8a838]" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1a1a2e] dark:bg-[#e8e4de] flex items-center justify-center text-white dark:text-[#1a1a2e] text-2xl font-serif shadow-lg">
              {nivelInfo.nivel}
            </div>
            <div>
              <p className="font-medium text-[#1a1a2e] dark:text-[#e8e4de]">{nivelInfo.titulo}</p>
              <p className="text-sm text-[#8a8a9e]">{user?.pontuacao || 0} / {nivelInfo.nextLevel} pontos</p>
            </div>
          </div>
          <div className="w-full bg-[#e8e0d6] dark:bg-[#2a2a3e] rounded-full h-2 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-[#1a1a2e] dark:bg-[#e8e4de] rounded-full" />
          </div>
          <p className="text-xs text-[#8a8a9e] mt-3">Mais {nivelInfo.nextLevel - (user?.pontuacao || 0)} pontos para o próximo nível</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="paper-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg text-[#1a1a2e] dark:text-[#e8e4de]">Últimas Movimentações</h3>
            <TrendingUp className="w-5 h-5 text-[#0d7377]" />
          </div>
          <div className="space-y-3">
            {planos.slice(0, 4).length === 0 ? (
              <p className="text-sm text-[#8a8a9e] text-center py-4">Nenhuma movimentação ainda</p>
            ) : (
              planos.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#f0ece6] dark:bg-[#1e1e2e]">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    p.status === "aprovado" ? "bg-[#5a7a5a]" : p.status === "pendente" ? "bg-[#e8a838]" : "bg-[#0d7377]"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1a1a2e] dark:text-[#e8e4de] truncate">{p.tema} — {p.status === "aprovado" ? "Aprovado" : p.status === "pendente" ? "Pendente" : p.status === "correcao" ? "Ajustes" : "Recusado"}</p>
                    <p className="text-xs text-[#8a8a9e]">{formatDate(p.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="paper-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg text-[#1a1a2e] dark:text-[#e8e4de]">Planos Recentes</h3>
          <Sparkles className="w-4 h-4 text-[#e8a838]" />
        </div>
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#8a8a9e] border-b border-[#e0d8cc]/50 dark:border-[#2a2a3e]/50">
                <th className="pb-3 font-medium">Protocolo</th>
                <th className="pb-3 font-medium">Tema</th>
                <th className="pb-3 font-medium">Matéria</th>
                <th className="pb-3 font-medium">Data</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {planos.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-[#8a8a9e]">Nenhum plano ainda</td></tr>
              ) : (
                planos.slice(0, 4).map((plano) => (
                  <tr key={plano.id} className="border-b border-[#e0d8cc]/30 dark:border-[#2a2a3e]/30">
                    <td className="py-3 font-mono text-xs text-[#8a8a9e]">{plano.protocolo}</td>
                    <td className="py-3 font-medium text-[#1a1a2e] dark:text-[#e8e4de]">{plano.tema}</td>
                    <td className="py-3 text-[#8a8a9e]">{plano.materia}</td>
                    <td className="py-3 text-[#8a8a9e] text-xs">{formatDate(plano.createdAt)}</td>
                    <td className="py-3">
                      <span className={
                        plano.status === "pendente" ? "badge-pendente" :
                        plano.status === "aprovado" ? "badge-aprovado" :
                        plano.status === "correcao" ? "badge-correcao" : "badge-reprovado"
                      }>
                        {plano.status === "pendente" ? "Pendente" :
                         plano.status === "aprovado" ? "Aprovado" :
                         plano.status === "correcao" ? "Ajustes" : "Recusado"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );

  const renderEnviar = () => (
    <div className="max-w-3xl mx-auto">
      <div className="paper-card p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#1a1a2e] dark:bg-[#e8e4de] flex items-center justify-center">
            <Send className="w-5 h-5 text-white dark:text-[#1a1a2e]" />
          </div>
          <div>
            <h2 className="text-2xl text-[#1a1a2e] dark:text-[#e8e4de]">Novo Plano de Aula</h2>
            <p className="text-sm text-[#8a8a9e]">Preencha os campos para criar seu plano</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Matéria", type: "select", options: MATERIAS, key: "materia" },
              { label: "Série", type: "select", options: SERIES, key: "serie" },
              { label: "Turma", type: "select", options: TURMAS, key: "turma" },
              { label: "Data", type: "date", key: "data" },
            ].map((field) => (
              <div key={field.key} className="space-y-1.5">
                <label className="text-xs font-medium text-[#5a5a6e] dark:text-[#9a9aae]">{field.label}</label>
                {field.type === "select" ? (
                  <select value={(formData as Record<string, string>)[field.key]} onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })} className="select-field text-sm">
                    {(field.options as string[]).map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type="date" value={(formData as Record<string, string>)[field.key]} onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })} className="input-field text-sm" />
                )}
              </div>
            ))}
          </div>

          {([
            { label: "Tema da Aula", key: "tema", placeholder: "Ex: Equações do 2º Grau", type: "input" },
            { label: "Objetivos", key: "objetivos", placeholder: "O que os alunos devem aprender?", type: "textarea", rows: 3 },
            { label: "Conteúdo", key: "conteudo", placeholder: "Descreva o conteúdo programático...", type: "textarea", rows: 4 },
            { label: "Metodologia", key: "metodologia", placeholder: "Como será ministrada a aula?", type: "textarea", rows: 3 },
            { label: "Recursos", key: "recursos", placeholder: "Materiais e recursos necessários", type: "textarea", rows: 2 },
            { label: "Avaliação", key: "avaliacao", placeholder: "Como os alunos serão avaliados?", type: "textarea", rows: 2 },
            { label: "Observações", key: "observacoes", placeholder: "Informações adicionais...", type: "textarea", rows: 2 },
          ] as const).map((field) => (
            <div key={field.key} className="space-y-1.5">
              <label className="text-xs font-medium text-[#5a5a6e] dark:text-[#9a9aae]">{field.label}</label>
              {field.type === "input" ? (
                <input type="text" value={(formData as Record<string, string>)[field.key]} onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })} className="input-field text-sm" placeholder={field.placeholder} />
              ) : (
                <textarea value={(formData as Record<string, string>)[field.key]} onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  className="textarea-field text-sm" placeholder={field.placeholder} rows={field.rows || 3} />
              )}
            </div>
          ))}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#5a5a6e] dark:text-[#9a9aae]">Anexar Arquivo</label>
            <label className="border-2 border-dashed border-[#e0d8cc] dark:border-[#2a2a3e] rounded-xl p-8 text-center hover:border-[#0d7377] transition-colors cursor-pointer group block">
              <Upload className="w-6 h-6 text-[#8a8a9e] mx-auto mb-2 group-hover:text-[#0d7377] transition-colors" />
              {arquivo ? (
                <p className="text-sm text-[#0d7377]">{arquivo.name}</p>
              ) : (
                <>
                  <p className="text-sm text-[#8a8a9e]">Arraste o arquivo ou clique para selecionar</p>
                  <p className="text-xs text-[#a8a8ae] mt-1">PDF · DOCX · Imagens (máx. 10MB)</p>
                </>
              )}
              <input type="file" className="hidden" onChange={(e) => setArquivo(e.target.files?.[0] || null)} accept=".pdf,.docx,.doc,.jpg,.png" />
            </label>
          </div>

          <button type="submit" className="btn-primary w-full group">
            <Send className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            Enviar Plano
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );

  const renderMeusPlanos = () => (
    <div className="space-y-4">
      <h2 className="text-2xl text-[#1a1a2e] dark:text-[#e8e4de]">Meus Planos</h2>
      {planos.length === 0 ? (
        <div className="paper-card p-12 text-center">
          <FileText className="w-10 h-10 text-[#d0c8bc] mx-auto mb-3" />
          <p className="text-[#8a8a9e]">Nenhum plano enviado ainda</p>
        </div>
      ) : (
        planos.map((plano, i) => (
          <motion.div key={plano.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="paper-card p-6">
            <div className="flex flex-wrap gap-2 items-start justify-between mb-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-[#1a1a2e] dark:text-[#e8e4de] truncate">{plano.tema}</h3>
                <p className="text-sm text-[#8a8a9e] truncate">{plano.materia} · {plano.serie} · Turma {plano.turma}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={
                  plano.status === "pendente" ? "badge-pendente" : plano.status === "aprovado" ? "badge-aprovado" : plano.status === "correcao" ? "badge-correcao" : "badge-reprovado"
                }>
                  {plano.status === "aprovado" && <CheckCircle className="w-3 h-3 mr-1" />}
                  {plano.status === "pendente" ? "Pendente" : plano.status === "aprovado" ? "Aprovado" : plano.status === "correcao" ? "Ajustes" : "Recusado"}
                </span>
                {plano.nota && <span className="text-sm font-serif text-[#0d7377]">{plano.nota}</span>}
              </div>
            </div>
            <p className="text-sm text-[#6a6a7e] dark:text-[#aaaaae] line-clamp-2 mb-3">{plano.objetivos}</p>
            <div className="flex items-center justify-between text-xs text-[#8a8a9e] pt-3 border-t border-[#e0d8cc]/30 dark:border-[#2a2a3e]/30">
              <span className="font-mono">{plano.protocolo}</span>
              <span>{formatDate(plano.createdAt)}</span>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );

  const renderRanking = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="paper-card p-8 text-center">
        <Trophy className="w-12 h-12 text-[#e8a838] mx-auto mb-3" />
        <h2 className="text-2xl text-[#1a1a2e] dark:text-[#e8e4de]">Ranking</h2>
        <p className="text-sm text-[#8a8a9e]">Professores com mais pontos</p>
      </div>
      {topRanking.length === 0 ? (
        <p className="text-center text-[#8a8a9e] py-8">Nenhum professor no ranking</p>
      ) : (
        topRanking.map((prof, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
            className={`paper-card p-5 flex items-center gap-4 flex-wrap ${prof.isMe ? "ring-2 ring-[#0d7377]" : ""}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
              prof.pos <= 3 ? "bg-[#1a1a2e] dark:bg-[#e8e4de] text-white dark:text-[#1a1a2e]" : "bg-[#f0ece6] dark:bg-[#1e1e2e] text-[#8a8a9e]"
            }`}>
              {prof.badge || prof.pos}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#1a1a2e] dark:text-[#e8e4de] truncate">{prof.nome}</p>
              <p className="text-xs text-[#8a8a9e]">{prof.pts} pontos</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xl font-serif text-[#1a1a2e] dark:text-[#e8e4de]">{prof.pts}</p>
            </div>
            <div className="hidden sm:block w-20 bg-[#e8e0d6] dark:bg-[#2a2a3e] rounded-full h-1.5">
              <motion.div initial={{ width: 0 }} animate={{ width: `${professores.length > 0 ? (prof.pts / Math.max(...professores.map((u: any) => u.pontuacao), 1)) * 100 : 0}%` }} transition={{ duration: 1, delay: i * 0.1 }} className="h-full bg-[#1a1a2e] dark:bg-[#e8e4de] rounded-full" />
            </div>
          </motion.div>
        ))
      )}
    </div>
  );

  const renderChat = () => (
    <div className="max-w-3xl mx-auto">
      <div className="paper-card p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#0d7377]/10 flex items-center justify-center mx-auto mb-5">
          <MessageSquareText className="w-7 h-7 text-[#0d7377]" />
        </div>
        <h2 className="text-2xl text-[#1a1a2e] dark:text-[#e8e4de] mb-3">Chat</h2>
        <p className="text-lg font-serif text-[#8a8a9e] mb-2">Em breve!</p>
        <p className="text-sm text-[#8a8a9e] max-w-md mx-auto">
          Estamos trabalhando em um chat inteligente para você se comunicar com coordenadores e administradores.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {tab === "dashboard" && renderDashboard()}
      {tab === "enviar" && renderEnviar()}
      {tab === "meus-planos" && renderMeusPlanos()}
      {tab === "ranking" && renderRanking()}
      {tab === "chat" && renderChat()}
    </>
  );
}
