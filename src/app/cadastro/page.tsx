"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";
import toast from "react-hot-toast";

export default function CadastroPage() {
  const router = useRouter();
  const { user, loading: authLoading, register } = useAuth();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tipo, setTipo] = useState<"professor" | "coordenador">("professor");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getPasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: "Fraca", color: "bg-[#e8614a]", width: "20%" };
    if (score <= 2) return { label: "Média", color: "bg-[#e8a838]", width: "40%" };
    if (score <= 3) return { label: "Boa", color: "bg-[#0d7377]", width: "60%" };
    if (score <= 4) return { label: "Forte", color: "bg-[#5a7a5a]", width: "80%" };
    return { label: "Excelente", color: "bg-[#5a7a5a]", width: "100%" };
  };

  useEffect(() => {
    if (!authLoading && user) {
      const map: Record<string, string> = { professor: "/dashboard/professor", coordenador: "/dashboard/coordenador", admin: "/dashboard/admin" };
      router.push(map[user.tipo] || "/");
    }
  }, [user, authLoading]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !password || !confirmPassword) { toast.error("Preencha todos os campos"); return; }
    if (password !== confirmPassword) { toast.error("Senhas não conferem"); return; }
    setIsLoading(true);
    try {
      const userTipo = await register({ nome, email, password, tipo });
      const map: Record<string, string> = { professor: "/dashboard/professor", coordenador: "/dashboard/coordenador", admin: "/dashboard/admin" };
      router.push(map[userTipo] || "/");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao cadastrar");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: "linear-gradient(135deg, #faf6f1 0%, #f0ece6 50%, #e8e0d6 100%)" }}>
        <div className="flex flex-col items-center gap-6 sm:gap-8 w-full max-w-xs">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20">
            <div className="absolute inset-0 border-[3px] border-[#0d7377]/20 rounded-full" />
            <div className="absolute inset-0 border-[3px] border-[#0d7377] border-t-transparent rounded-full animate-spin" />
            <motion.div className="absolute inset-0 flex items-center justify-center" animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Sparkles className="w-7 h-7 sm:w-9 sm:h-9 text-[#0d7377]" />
            </motion.div>
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-lg sm:text-xl font-bold text-[#1a1a2e]" style={{ fontFamily: "'DM Serif Display', serif" }}>
              <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}>EduPlan Manager</motion.span>
            </h1>
            <div className="flex items-center justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#0d7377]" animate={{ y: [-4, 4, -4], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} />
              ))}
            </div>
            <p className="text-sm text-[#8a8a9e]">Preparando sua experiência...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout
      title="Junte-se a nós"
      subtitle="Crie sua conta e comece a planejar."
      features={["Crie planos de aula completos", "Acompanhe métricas e desempenho", "Colabore com coordenadores"]}
    >
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#0d7377] hover:text-[#0a6367] mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Voltar
      </Link>

      <div className="mb-8">
        <h2 className="text-[#1a1a2e] dark:text-[#e8e4de] text-3xl" style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.02em" }}>Criar Conta</h2>
        <p className="text-[#8a8a9e] text-sm mt-2">Cadastre-se para começar</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label htmlFor="reg-nome" className="text-sm font-medium text-[#5a5a6e] dark:text-[#9a9aae] mb-1.5 block">Nome</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8a9e]" aria-hidden="true" />
            <input id="reg-nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-[#1a1a2e] border-2 border-[#e0d8cc] dark:border-[#2a2a3e] rounded-xl focus:border-[#0d7377] outline-none transition-all text-[#1a1a2e] dark:text-[#e8e4de] placeholder:text-[#a09888] dark:placeholder:text-[#6a6a7e]" placeholder="Seu nome completo" />
          </div>
        </div>
        <div>
          <label htmlFor="reg-email" className="text-sm font-medium text-[#5a5a6e] dark:text-[#9a9aae] mb-1.5 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8a9e]" aria-hidden="true" />
            <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-[#1a1a2e] border-2 border-[#e0d8cc] dark:border-[#2a2a3e] rounded-xl focus:border-[#0d7377] outline-none transition-all text-[#1a1a2e] dark:text-[#e8e4de] placeholder:text-[#a09888] dark:placeholder:text-[#6a6a7e]" placeholder="seu@email.com" />
          </div>
        </div>
        <div>
          <label htmlFor="reg-password" className="text-sm font-medium text-[#5a5a6e] dark:text-[#9a9aae] mb-1.5 block">Senha</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8a9e]" aria-hidden="true" />
            <input id="reg-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-3.5 bg-white dark:bg-[#1a1a2e] border-2 border-[#e0d8cc] dark:border-[#2a2a3e] rounded-xl focus:border-[#0d7377] outline-none transition-all text-[#1a1a2e] dark:text-[#e8e4de] placeholder:text-[#a09888] dark:placeholder:text-[#6a6a7e]" placeholder="••••••••" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8a9e] hover:text-[#1a1a2e] dark:hover:text-[#e8e4de]" aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}>
              {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
          {password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-[#e8e0d6] dark:bg-[#2a2a3e] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${getPasswordStrength(password).color}`} style={{ width: getPasswordStrength(password).width }} />
              </div>
              <span className="text-[10px] text-[#8a8a9e] font-medium w-12 text-right">{getPasswordStrength(password).label}</span>
            </div>
          )}
        </div>
        <div>
          <label htmlFor="reg-confirm" className="text-sm font-medium text-[#5a5a6e] dark:text-[#9a9aae] mb-1.5 block">Confirmar Senha</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8a9e]" aria-hidden="true" />
            <input id="reg-confirm" type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-10 py-3.5 bg-white dark:bg-[#1a1a2e] border-2 border-[#e0d8cc] dark:border-[#2a2a3e] rounded-xl focus:border-[#0d7377] outline-none transition-all text-[#1a1a2e] dark:text-[#e8e4de] placeholder:text-[#a09888] dark:placeholder:text-[#6a6a7e]" placeholder="••••••••" />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8a9e] hover:text-[#1a1a2e] dark:hover:text-[#e8e4de]" aria-label={showConfirm ? "Esconder senha" : "Mostrar senha"}>
              {showConfirm ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="reg-tipo" className="text-sm font-medium text-[#5a5a6e] dark:text-[#9a9aae] mb-1.5 block">Tipo de Conta</label>
          <select id="reg-tipo" value={tipo} onChange={(e) => setTipo(e.target.value as any)} className="w-full px-4 py-3.5 bg-white dark:bg-[#1a1a2e] border-2 border-[#e0d8cc] dark:border-[#2a2a3e] rounded-xl focus:border-[#0d7377] outline-none transition-all text-[#1a1a2e] dark:text-[#e8e4de] text-sm">
            <option value="professor">Professor</option>
            <option value="coordenador">Coordenador</option>
          </select>
        </div>
        <motion.button type="submit" disabled={isLoading} className="btn-primary w-full mt-2"
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <><Sparkles className="w-4 h-4" /> Criar Conta</>
          )}
        </motion.button>
      </form>

      <p className="text-center text-sm text-[#8a8a9e] mt-8">
        Já tem conta?{" "}
        <Link href="/" className="text-[#0d7377] hover:text-[#0a6367] font-medium underline underline-offset-4 decoration-[#0d7377]/30">Entrar</Link>
      </p>
    </AuthLayout>
  );
}
