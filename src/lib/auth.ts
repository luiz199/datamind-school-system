import getClient from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  tipo: "professor" | "coordenador" | "admin";
}

export async function requireAuth(req: Request): Promise<AuthUser> {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) throw new Error("Não autorizado");
  const token = auth.replace("Bearer ", "");
  const db = (await getClient()).db("eduplan");
  const session = await db.collection("sessions").findOne({ token });
  if (!session) throw new Error("Sessão inválida");
  const user = await db.collection("users").findOne({ _id: new ObjectId(session.userId) });
  if (!user) throw new Error("Usuário não encontrado");
  return { id: user._id.toString(), nome: user.nome, email: user.email, tipo: user.tipo };
}

export async function requireRole(req: Request, roles: string[]): Promise<AuthUser> {
  const user = await requireAuth(req);
  if (!roles.includes(user.tipo)) throw new Error("Permissão negada");
  return user;
}
