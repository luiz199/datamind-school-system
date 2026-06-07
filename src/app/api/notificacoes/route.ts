import { NextResponse } from "next/server";
import getClient from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await requireAuth(req);
    const { usuarioId, tipo, titulo, mensagem } = await req.json();
    if (!usuarioId || !tipo || !titulo) return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });
    const db = (await getClient()).db("eduplan");
    await db.collection("notificacoes").insertOne({ usuarioId, tipo, titulo, mensagem, lida: false, createdAt: new Date() });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function GET(req: Request) {
  try {
    const user = await requireAuth(req);
    const db = (await getClient()).db("eduplan");
    const notifs = await db.collection("notificacoes")
      .find({ usuarioId: user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();
    return NextResponse.json(notifs.map((n: any) => ({ ...n, id: n._id.toString(), _id: undefined })));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: e.message === "Não autorizado" || e.message === "Sessão inválida" ? 401 : 500 }); }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireAuth(req);
    const db = (await getClient()).db("eduplan");
    await db.collection("notificacoes").updateMany({ usuarioId: user.id, lida: false }, { $set: { lida: true } });
    return NextResponse.json({ ok: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
