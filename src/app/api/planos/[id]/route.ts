import { NextResponse } from "next/server";
import getClient from "@/lib/mongodb";
import { ObjectId } from 'mongodb';
import { requireRole } from "@/lib/auth";

const allowedFields = ["status", "nota", "comentario", "updatedAt"];

function sanitize(body: any) {
  const clean: any = {};
  for (const key of allowedFields) {
    if (body[key] !== undefined) clean[key] = body[key];
  }
  return clean;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, ["coordenador", "admin"]);
    const body = await req.json();
    const data = sanitize(body);
    data.updatedAt = new Date();
    const db = (await getClient()).db("eduplan");
    const result = await db.collection("planos").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: data }
    );
    if (!result.matchedCount) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: e.message === "Não autorizado" || e.message === "Sessão inválida" ? 401 : e.message === "Permissão negada" ? 403 : 500 }); }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireRole(req, ["professor", "admin"]);
    const db = (await getClient()).db("eduplan");
    const plano = await db.collection("planos").findOne({ _id: new ObjectId(params.id) });
    if (!plano) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    if (user.tipo !== "admin" && plano.professorId !== user.id)
      return NextResponse.json({ error: "Permissão negada" }, { status: 403 });
    await db.collection("planos").deleteOne({ _id: new ObjectId(params.id) });
    return NextResponse.json({ ok: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: e.message === "Não autorizado" || e.message === "Sessão inválida" ? 401 : e.message === "Permissão negada" ? 403 : 500 }); }
}
