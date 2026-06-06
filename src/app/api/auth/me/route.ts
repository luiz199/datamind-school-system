import { NextResponse } from "next/server";
import getClient from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const db = (await getClient()).db("eduplan");
    const session = await db.collection("sessions").findOne({ token });
    if (!session) return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });

    const user = await db.collection("users").findOne({ _id: new ObjectId(session.userId) });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const { _id, password, ...safe } = user;
    return NextResponse.json({ user: { id: user._id.toString(), ...safe } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
