import { NextResponse } from "next/server";
import getClient from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

const allowedFields = ["nome", "email", "password", "tipo", "foto", "pontuacao", "nivel"];

function sanitize(body: any) {
  const clean: any = {};
  for (const key of allowedFields) {
    if (body[key] !== undefined) clean[key] = body[key];
  }
  return clean;
}

export async function GET() {
  try {
    const db = (await getClient()).db("eduplan");
    const users = await db.collection("users").find().toArray();
    return NextResponse.json(users.map((u: any) => {
      const { password, ...safe } = u;
      return { ...safe, id: u._id.toString(), _id: undefined };
    }));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = sanitize(body);
    if (!data.nome || !data.email || !data.password || !data.tipo)
      return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });
    const db = (await getClient()).db("eduplan");
    const existing = await db.collection("users").findOne({ email: data.email });
    if (existing) return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });
    data.password = await bcrypt.hash(data.password, 10);
    data.foto = data.foto || "";
    data.pontuacao = data.pontuacao || 0;
    data.nivel = data.nivel || 1;
    data.createdAt = new Date();
    const result = await db.collection("users").insertOne(data);
    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function PATCH(req: Request) {
  try {
    const { id, ...body } = await req.json();
    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
    const data = sanitize(body);
    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    const db = (await getClient()).db("eduplan");
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );
    if (!result.matchedCount) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
    const db = (await getClient()).db("eduplan");
    const result = await db.collection("users").deleteOne({ _id: new ObjectId(id) });
    if (!result.deletedCount) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
