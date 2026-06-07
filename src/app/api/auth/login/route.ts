import { NextResponse } from "next/server";
import getClient from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });

    const db = (await getClient()).db("eduplan");
    const user = await db.collection("users").findOne({ email });
    if (!user) return NextResponse.json({ error: "Email ou senha incorretos" }, { status: 401 });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return NextResponse.json({ error: "Email ou senha incorretos" }, { status: 401 });

    const { _id, password: _, ...safe } = user;
    const token = crypto.randomUUID();
    await db.collection("sessions").createIndex({ createdAt: 1 }, { expireAfterSeconds: 604800 });
    await db.collection("sessions").insertOne({ userId: user._id.toString(), token, createdAt: new Date() });

    return NextResponse.json({ user: { id: user._id.toString(), ...safe }, token });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
