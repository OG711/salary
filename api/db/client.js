import dotenv from 'dotenv';

dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

let db;

if (url && (url.startsWith('libsql:') || url.startsWith('https:') || url.startsWith('http:'))) {
  // Use @libsql/client/web for pure HTTP without native binary dependencies (optimal for Vercel Serverless)
  const { createClient } = await import('@libsql/client/web');
  db = createClient({
    url,
    authToken: authToken || undefined,
  });
} else if (process.env.VERCEL) {
  // On Vercel when TURSO_DATABASE_URL is not yet configured in project environment variables
  db = {
    execute: async () => {
      throw new Error(
        'TURSO_DATABASE_URL is not set in Vercel Environment Variables. Please add TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in Vercel Project Settings.'
      );
    },
  };
} else {
  // Local development fallback with local SQLite file
  const { createClient } = await import('@libsql/client');
  db = createClient({
    url: url || 'file:local.db',
    authToken: authToken || undefined,
  });
}

export { db };
