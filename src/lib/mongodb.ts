import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cachedClient: MongoClient | null = (global as any).mongoClient || null;
let cachedDb: Db | null = (global as any).mongoDb || null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
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
