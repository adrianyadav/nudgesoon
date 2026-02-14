import { Pool, QueryResult, QueryResultRow } from 'pg';
import { ExpiryItem, User } from './types';

// Singleton connection pool
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: {
        rejectUnauthorized: false, // Neon requires SSL
      },  
      max: 20, // Connection pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  return pool.query<T>(text, params);
}

// User operations
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query<User>(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

export async function createUser(
  email: string,
  passwordHash: string,
  name?: string
): Promise<User> {
  const result = await query<User>(
    'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *',
    [email, passwordHash, name || null]
  );
  return result.rows[0];
}

// Database operations — always order by expiry date (soonest first)
export async function getAllItems(userId?: number): Promise<ExpiryItem[]> {
  if (userId) {
    const result = await query<ExpiryItem>(
      'SELECT * FROM expiry_items WHERE user_id = $1 ORDER BY expiry_date ASC',
      [userId]
    );
    return result.rows;
  }
  const result = await query<ExpiryItem>(
    'SELECT * FROM expiry_items ORDER BY expiry_date ASC'
  );
  return result.rows;
}

export async function getItemById(id: number): Promise<ExpiryItem | null> {
  const result = await query<ExpiryItem>(
    'SELECT * FROM expiry_items WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function createItem(
  name: string,
  expiryDate: string,
  userId?: number
): Promise<ExpiryItem> {
  const result = await query<ExpiryItem>(
    'INSERT INTO expiry_items (name, expiry_date, user_id) VALUES ($1, $2, $3) RETURNING *',
    [name, expiryDate, userId ?? null]
  );
  return result.rows[0];
}

export async function updateItem(
  id: number,
  name: string,
  expiryDate: string
): Promise<ExpiryItem | null> {
  const result = await query<ExpiryItem>(
    'UPDATE expiry_items SET name = $1, expiry_date = $2 WHERE id = $3 RETURNING *',
    [name, expiryDate, id]
  );
  return result.rows[0] || null;
}

export async function deleteItem(id: number): Promise<boolean> {
  const result = await query(
    'DELETE FROM expiry_items WHERE id = $1',
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function deleteAllItems(userId: number): Promise<number> {
  const result = await query(
    'DELETE FROM expiry_items WHERE user_id = $1',
    [userId]
  );
  return result.rowCount ?? 0;
}
