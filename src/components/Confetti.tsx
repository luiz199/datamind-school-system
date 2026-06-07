"use client";

import { useEffect, useState } from "react";

interface Particle {
  id: number; x: number; y: number; color: string; rotation: number; scale: number; delay: number;
}

const COLORS = ["#e8614a", "#e8a838", "#0d7377", "#5a7a5a", "#d4a373", "#c8b6a0"];

export default function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) { setParticles([]); return; }
    const p: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.8,
      delay: Math.random() * 0.5,
    }));
    setParticles(p);
    const t = setTimeout(() => setParticles([]), 3000);
    return () => clearTimeout(t);
  }, [active]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <div key={p.id} className="absolute animate-confetti" style={{
          left: `${p.x}%`, top: `${p.y}%`, width: 8, height: 8, borderRadius: "50%",
          backgroundColor: p.color, transform: `rotate(${p.rotation}deg) scale(${p.scale})`,
          animationDelay: `${p.delay}s`, animationDuration: "1.5s",
        }} />
      ))}
    </div>
  );
}
