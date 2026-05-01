import { MongoClient, Db } from 'mongodb';

let cachedClient: MongoClient | null = (global as any).mongoClient || null;
let cachedDb: Db | null = (global as any).mongoDb || null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db();

  cachedClient = client;
  cachedDb = db;

  if (process.env.NODE_ENV === 'development') {
    (global as any).mongoClient = client;
    (global as any).mongoDb = db;
  }

  return { client, db };
}
