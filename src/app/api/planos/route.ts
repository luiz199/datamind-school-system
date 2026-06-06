import { NextResponse } from "next/server";
import getClient from "@/lib/mongodb";

const allowedFields = ["professorId", "professorNome", "materia", "serie", "turma", "data", "tema", "objetivos", "conteudo", "metodologia", "recursos", "avaliacao", "observacoes", "arquivoNome", "arquivoTipo", "status", "protocolo", "nota", "comentario"];

function sanitize(body: any) {
  const clean: any = {};
  for (const key of allowedFields) {
    if (body[key] !== undefined) clean[key] = body[key];
  }
  return clean;
}

export async function GET(req: Request) {
  try {
    const db = (await getClient()).db("eduplan");
    const { searchParams } = new URL(req.url);
    const filter: any = {};
    const professorId = searchParams.get("professorId");
    const status = searchParams.get("status");
    if (professorId) filter.professorId = professorId;
    if (status) filter.status = status;
    const planos = await db.collection("planos").find(filter).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(planos.map((p: any) => ({ ...p, id: p._id.toString(), _id: undefined })));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = sanitize(body);
    if (!data.tema || !data.professorId) return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });
    const db = (await getClient()).db("eduplan");
    data.createdAt = new Date();
    data.updatedAt = new Date();
    const result = await db.collection("planos").insertOne(data);
    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
