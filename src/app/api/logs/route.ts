import { NextResponse } from "next/server";
import getClient from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await requireAuth(req);
    const db = (await getClient()).db("eduplan");
    const logs = await db.collection("logs").find().sort({ createdAt: -1 }).toArray();
    return NextResponse.json(logs.map((l: any) => ({ ...l, id: l._id.toString(), _id: undefined })));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: e.message === "Não autorizado" || e.message === "Sessão inválida" ? 401 : e.message === "Permissão negada" ? 403 : 500 }); }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth(req);
    const { acao, detalhes } = await req.json();
    if (!acao) return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });
    const db = (await getClient()).db("eduplan");
    const result = await db.collection("logs").insertOne({
      usuarioId: user.id, usuarioNome: user.nome, acao, detalhes, createdAt: new Date(),
    });
    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: e.message === "Não autorizado" || e.message === "Sessão inválida" ? 401 : e.message === "Permissão negada" ? 403 : 500 }); }
}
