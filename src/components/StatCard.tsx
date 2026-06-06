"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  delay?: number;
}

export default function StatCard({ label, value, icon: Icon, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="paper-card p-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#8a8a9e] font-medium">{label}</p>
          <p className="text-2xl font-serif text-[#1a1a2e] dark:text-[#e8e4de] mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-xl bg-[#f0ece6] dark:bg-[#1e1e2e]">
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </motion.div>
  );
}
