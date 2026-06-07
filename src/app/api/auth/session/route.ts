import { NextResponse } from "next/server";
import getClient from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";

export async function DELETE(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth || !auth.startsWith("Bearer ")) return NextResponse.json({ ok: true });
    const token = auth.replace("Bearer ", "");
    const db = (await getClient()).db("eduplan");
    await db.collection("sessions").deleteOne({ token });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ ok: true }); }
}
