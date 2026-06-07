import { NextResponse } from "next/server";
import getClient from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireAuth } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth(req);
    const db = (await getClient()).db("eduplan");
    let plano;
    try { plano = await db.collection("planos").findOne({ _id: new ObjectId(params.id) }); } catch { }
    if (!plano) plano = await db.collection("planos").findOne({ id: params.id });
    if (!plano) return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
    if (!plano.arquivoBase64 || !plano.arquivoNome || !plano.arquivoTipo)
      return NextResponse.json({ error: "Nenhum arquivo anexado" }, { status: 404 });

    const buffer = Buffer.from(plano.arquivoBase64, "base64");
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": plano.arquivoTipo,
        "Content-Disposition": `attachment; filename="${plano.arquivoNome}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
