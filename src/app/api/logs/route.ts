import { NextResponse } from "next/server";
import getClient from "@/lib/mongodb";

export async function GET() {
  try {
    const db = (await getClient()).db("eduplan");
    const logs = await db.collection("logs").find().sort({ createdAt: -1 }).toArray();
    return NextResponse.json(logs.map((l: any) => ({ ...l, id: l._id.toString(), _id: undefined })));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const { usuarioId, usuarioNome, acao, detalhes } = await req.json();
    if (!usuarioId || !acao) return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });
    const db = (await getClient()).db("eduplan");
    const result = await db.collection("logs").insertOne({
      usuarioId, usuarioNome, acao, detalhes, createdAt: new Date(),
    });
    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
