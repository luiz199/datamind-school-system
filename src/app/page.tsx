"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import AuthLayout from "@/components/AuthLayout";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);

  const redirectByRole = (tipo: string) => {
    const map: Record<string, string> = {
      professor: "/dashboard/professor",
      coordenador: "/dashboard/coordenador",
      admin: "/dashboard/admin",
    };
    router.push(map[tipo] || "/");
  };

  useEffect(() => {
    if (!loading && user) redirectByRole(user.tipo);
  }, [user, loading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Preencha todos os campos"); return; }
    setIsLoading(true);
    try {
      const tipo = await login(email, password);
      redirectByRole(tipo);
    } catch {
      toast.error("Email ou senha incorretos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast.error("Contate o administrador para redefinir sua senha");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #faf6f1 0%, #f0ece6 50%, #e8e0d6 100%)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#1a1a2e] border-t-transparent rounded-full animate-spin" />
          <div className="w-32 h-3 bg-[#e0d8cc] rounded-full animate-pulse" />
          <div className="w-24 h-3 bg-[#e0d8cc] rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <AuthLayout
      title={<>EduPlan<br />Manager</>}
      subtitle="Transforme sua maneira de planejar aulas."
      features={["Organize planos de aula", "Acompanhe métricas", "Colabore em tempo real"]}
    >
      <div className="mb-8">
        <motion.h2 variants={itemVariants} initial="hidden" animate="visible" className="text-[#1a1a2e] dark:text-[#e8e4de] text-3xl" style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.02em" }}>Entrar</motion.h2>
        <motion.p variants={itemVariants} initial="hidden" animate="visible" className="text-[#8a8a9e] text-sm mt-2">Acesse sua conta para continuar</motion.p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label htmlFor="login-email" className="text-sm font-medium text-[#5a5a6e] dark:text-[#9a9aae] mb-1.5 block">Email</label>
          <div className="relative group">
            <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === "email" ? "text-[#0d7377]" : "text-[#8a8a9e]"}`} aria-hidden="true" />
            <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)}
              className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-[#1a1a2e] border-2 border-[#e0d8cc] dark:border-[#2a2a3e] rounded-xl focus:border-[#0d7377] dark:focus:border-[#0d7377] focus:ring-0 outline-none transition-all duration-300 text-[#1a1a2e] dark:text-[#e8e4de] placeholder:text-[#a09888] dark:placeholder:text-[#6a6a7e] shadow-sm hover:border-[#d0c8bc] dark:hover:border-[#3a3a4e]" placeholder="seu@email.com" />
            <div className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#0d7377] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-left`} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="text-sm font-medium text-[#5a5a6e] dark:text-[#9a9aae]">Senha</label>
            <button type="button" onClick={handleForgotPassword} className="text-xs text-[#0d7377] hover:text-[#0a6367] underline underline-offset-2 decoration-[#0d7377]/30" aria-label="Redefinir senha">Esqueci a senha</button>
          </div>
          <div className="relative group">
            <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === "password" ? "text-[#0d7377]" : "text-[#8a8a9e]"}`} aria-hidden="true" />
            <input id="login-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)}
              className="w-full pl-10 pr-10 py-3.5 bg-white dark:bg-[#1a1a2e] border-2 border-[#e0d8cc] dark:border-[#2a2a3e] rounded-xl focus:border-[#0d7377] dark:focus:border-[#0d7377] focus:ring-0 outline-none transition-all duration-300 text-[#1a1a2e] dark:text-[#e8e4de] placeholder:text-[#a09888] dark:placeholder:text-[#6a6a7e] shadow-sm hover:border-[#d0c8bc] dark:hover:border-[#3a3a4e]" placeholder="••••••••" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8a9e] hover:text-[#1a1a2e] dark:hover:text-[#e8e4de] transition-colors" aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}>
              {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
            </button>
            <div className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#0d7377] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-left`} />
          </div>
        </div>
        <motion.button type="submit" disabled={isLoading} className="btn-primary w-full group relative overflow-hidden"
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d7377] to-[#0a6367] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>Entrar <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" /></>
            )}
          </span>
        </motion.button>
      </form>

      <div className="mt-8 text-center">
        <Link href="/cadastro" className="text-sm text-[#0d7377] dark:text-[#0d7377] hover:text-[#0a6367] font-medium underline underline-offset-4 decoration-[#0d7377]/30 hover:decoration-[#0d7377]/60 transition-all group inline-flex items-center gap-1">
          Criar nova conta <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="mt-10 pt-6 border-t border-dashed border-[#e0d8cc] dark:border-[#2a2a3e]">
        <div className="flex items-center justify-center gap-6 text-[#6a6a7e] text-xs">
          {[
            { label: "Professor", color: "bg-[#e8a838]" },
            { label: "Coordenador", color: "bg-[#0d7377]" },
            { label: "Admin", color: "bg-[#1a1a2e]" },
          ].map((item) => (
            <span key={item.label} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/50 dark:bg-[#1a1a2e]/50">
              <span className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </AuthLayout>
  );
}
