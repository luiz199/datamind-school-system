import { NextResponse } from "next/server";
import getClient from "@/lib/mongodb";
import { ObjectId } from 'mongodb';

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
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
