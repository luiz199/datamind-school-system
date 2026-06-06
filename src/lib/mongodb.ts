import { MongoClient } from "mongodb";

let clientPromise: Promise<MongoClient> | null = null;

export default async function getClient(): Promise<MongoClient> {
  if (clientPromise) return clientPromise;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Defina a variável MONGODB_URI no .env.local");
  const client = new MongoClient(uri);
  if (process.env.NODE_ENV === "development") {
    const g = global as any;
    if (!g._mongoClientPromise) g._mongoClientPromise = client.connect();
    clientPromise = g._mongoClientPromise;
  } else {
    clientPromise = client.connect();
  }
  return clientPromise!;
}
