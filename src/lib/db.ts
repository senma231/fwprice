
'use server';

import { Pool, type QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let pool: Pool;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (connectionString) {
      pool = new Pool({ connectionString });
    } else {
      pool = new Pool({
        host: process.env.POSTGRES_HOST,
        port: Number(process.env.POSTGRES_PORT),
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DATABASE,
      });
    }

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }
  return pool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const start = Date.now();
  const client = await getPool().connect();
  try {
    const res = await client.query<T>(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text: text.substring(0,100), duration, rows: res.rowCount });
    return res;
  } finally {
    client.release();
  }
}

// Helper to convert row keys from snake_case (DB) to camelCase (JS/TS)
export function toCamelCase<T>(row: any): T {
    const newRow: any = {};
    for (const key in row) {
        const camelCaseKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        newRow[camelCaseKey] = row[key];
    }
    return newRow as T;
}

// Helper to convert object keys from camelCase (JS/TS) to snake_case (DB) for inserts/updates
export function toSnakeCase(obj: Record<string, any>): Record<string, any> {
    const newObj: Record<string, any> = {};
    for (const key in obj) {
        const snakeCaseKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        newObj[snakeCaseKey] = obj[key];
    }
    return newObj;
}
