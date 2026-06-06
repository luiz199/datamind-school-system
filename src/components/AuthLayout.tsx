"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  title: ReactNode;
  subtitle: string;
  features: string[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function AuthLayout({ children, title, subtitle, features }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #faf6f1 0%, #f0ece6 50%, #e8e0d6 100%)" }}>
      <div className="hidden lg:flex w-1/2 relative items-center justify-center p-12 overflow-hidden" style={{ background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, #e8a838 0%, transparent 50%), radial-gradient(circle at 80% 20%, #0d7377 0%, transparent 50%), radial-gradient(circle at 50% 80%, #e8614a 0%, transparent 50%)",
          filter: "blur(60px)",
        }} />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute top-1/4 -left-20 w-72 h-72 border border-white/10 rounded-full" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 45, repeat: Infinity, ease: "linear" }} className="absolute bottom-1/3 -right-16 w-56 h-56 border border-white/10 rounded-full" />
        <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/3 right-1/4 w-3 h-3 bg-[#e8a838]/30 rounded-full blur-sm" />
        <motion.div animate={{ y: [8, -8, 8] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-[#0d7377]/40 rounded-full blur-sm" />
        <motion.div animate={{ y: [-6, 6, -6] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute top-2/3 left-1/4 w-4 h-4 bg-[#e8614a]/20 rounded-full blur-sm" />

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 text-center max-w-md">
          <motion.div variants={itemVariants} className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 mb-8">
            <Sparkles className="w-8 h-8 text-[#e8a838]" />
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-white text-5xl leading-tight mb-3" style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.02em" }}>
            {title}
          </motion.h1>
          <motion.p variants={itemVariants} className="text-white/40 text-base leading-relaxed mb-10" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {subtitle}
          </motion.p>
          <motion.div variants={itemVariants} className="space-y-4 text-left max-w-xs mx-auto">
            {features.map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#e8a838]" />
                </div>
                <span className="text-white/30 text-sm">{text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1a1a2e] dark:bg-[#e8e4de] mb-4">
              <Sparkles className="w-6 h-6 text-white dark:text-[#1a1a2e]" />
            </div>
            <h1 className="text-[#1a1a2e] dark:text-[#e8e4de] text-3xl" style={{ fontFamily: "'DM Serif Display', serif" }}>EduPlan Manager</h1>
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
