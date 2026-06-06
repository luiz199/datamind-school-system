"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Lock, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ProfileModal({ open, onClose }: Props) {
  const { user, updateUserData } = useAuth();
  const [nome, setNome] = useState(user?.nome || "");
  const [email, setEmail] = useState(user?.email || "");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!nome || !user) { toast.error("Nome é obrigatório"); return; }
    setLoading(true);
    try {
      const updates: any = { nome, email };
      if (novaSenha) {
        updates.password = novaSenha;
      }
      await api.users.update(user.id, updates);
      await updateUserData({ nome, email });
      toast.success("Perfil atualizado!");
      onClose();
    } catch { toast.error("Erro ao atualizar"); } finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white dark:bg-[#16161f] rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-[#1a1a2e] dark:text-[#e8e4de]">Editar Perfil</h3>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#f0ece6] dark:hover:bg-[#1e1e2e] text-[#8a8a9e]"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#5a5a6e] dark:text-[#9a9aae] block mb-1">Nome</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8a9e]" />
                  <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="input-field pl-10 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[#5a5a6e] dark:text-[#9a9aae] block mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8a9e]" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10 text-sm" />
                </div>
              </div>
              <hr className="border-[#e0d8cc]/50 dark:border-[#2a2a3e]/50" />
              <p className="text-xs text-[#8a8a9e]">Alterar senha (opcional)</p>
              <div>
                <label className="text-sm font-medium text-[#5a5a6e] dark:text-[#9a9aae] block mb-1">Nova senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8a9e]" />
                  <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} className="input-field pl-10 text-sm" placeholder="••••••••" />
                </div>
              </div>
              <button onClick={handleSave} disabled={loading} className="btn-primary w-full">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Salvar</>}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
