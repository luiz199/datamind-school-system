import { NextResponse } from "next/server";
import getClient from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { nome, email, password, tipo } = await req.json();
    if (!nome || !email || !password || !tipo)
      return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });

    const db = (await getClient()).db("eduplan");
    const existing = await db.collection("users").findOne({ email });
    if (existing) return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.collection("users").insertOne({
      nome, email, password: hashedPassword, tipo, foto: "", pontuacao: 0, nivel: 1, createdAt: new Date(),
    });

    const token = crypto.randomUUID();
    await db.collection("sessions").insertOne({ userId: result.insertedId.toString(), token, createdAt: new Date() });

    return NextResponse.json({
      user: { id: result.insertedId.toString(), nome, email, tipo, foto: "", pontuacao: 0, nivel: 1, createdAt: new Date() },
      token,
    }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
