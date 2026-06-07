import { NextResponse } from "next/server";
import getClient from "@/lib/mongodb";
import { requireRole } from "@/lib/auth";

export async function GET() {
  try {
    const db = (await getClient()).db("eduplan");
    const config = await db.collection("config").findOne({ key: "system" });
    const defaultConfig = { key: "system", nome: "EduPlan Manager", pontosEnvio: 10, pontosAprovacao: 20, bonusDestaque: 50, manutencao: false };
    return NextResponse.json(config || defaultConfig);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function PUT(req: Request) {
  try {
    await requireRole(req, ["admin"]);
    const data = await req.json();
    const db = (await getClient()).db("eduplan");
    await db.collection("config").updateOne({ key: "system" }, { $set: data }, { upsert: true });
    return NextResponse.json({ ok: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: e.message === "Não autorizado" || e.message === "Sessão inválida" ? 401 : e.message === "Permissão negada" ? 403 : 500 }); }
}
