import { NextResponse } from "next/server";
import getClient from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    const db = (await getClient()).db("eduplan");
    const hash = await bcrypt.hash("123456", 10);
    const seeds = [
      { nome: "Maria Professora", email: "professor@eduplan.com", password: hash, tipo: "professor", foto: "", pontuacao: 280, nivel: 3, createdAt: new Date() },
      { nome: "Ana Coordenadora", email: "coordenador@eduplan.com", password: hash, tipo: "coordenador", foto: "", pontuacao: 0, nivel: 1, createdAt: new Date() },
      { nome: "Admin Sistema", email: "admin@eduplan.com", password: hash, tipo: "admin", foto: "", pontuacao: 0, nivel: 1, createdAt: new Date() },
    ];
    for (const s of seeds) {
      await db.collection("users").updateOne(
        { email: s.email },
        { $setOnInsert: s },
        { upsert: true }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
