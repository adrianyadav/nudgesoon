import { Pool, QueryResult, QueryResultRow } from 'pg';
import { ExpiryItem, User } from './types';
import { encrypt, decrypt } from './encryption';
import { getPostgresPoolConfig } from './postgres-config';

// Singleton connection pool
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      ...getPostgresPoolConfig(process.env.POSTGRES_URL),
      max: 20, // Connection pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow>(
  text: string,
  params?: unknown[]
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

export async function createOAuthUser(
  email: string,
  name?: string
): Promise<User> {
  const result = await query<User>(
    'INSERT INTO users (email, password_hash, name) VALUES ($1, NULL, $2) RETURNING *',
    [email, name || null]
  );
  return result.rows[0];
}

function decryptItem(item: ExpiryItem): ExpiryItem {
  return { ...item, name: decrypt(item.name) };
}

// Database operations — always order by expiry date (soonest first)
export async function getAllItems(userId?: number): Promise<ExpiryItem[]> {
  let rows: ExpiryItem[];
  if (userId) {
    const result = await query<ExpiryItem>(
      'SELECT * FROM expiry_items WHERE user_id = $1 AND (archived_at IS NULL) ORDER BY expiry_date ASC',
      [userId]
    );
    rows = result.rows;
  } else {
    const result = await query<ExpiryItem>(
      'SELECT * FROM expiry_items WHERE archived_at IS NULL ORDER BY expiry_date ASC'
    );
    rows = result.rows;
  }
  return rows.map(decryptItem);
}

export async function getArchivedItems(userId?: number): Promise<ExpiryItem[]> {
  let rows: ExpiryItem[];
  if (userId) {
    const result = await query<ExpiryItem>(
      'SELECT * FROM expiry_items WHERE user_id = $1 AND archived_at IS NOT NULL ORDER BY archived_at DESC',
      [userId]
    );
    rows = result.rows;
  } else {
    const result = await query<ExpiryItem>(
      'SELECT * FROM expiry_items WHERE archived_at IS NOT NULL ORDER BY archived_at DESC'
    );
    rows = result.rows;
  }
  return rows.map(decryptItem);
}

export async function archiveItem(id: number): Promise<boolean> {
  const result = await query(
    'UPDATE expiry_items SET archived_at = NOW() WHERE id = $1',
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function archiveAllItems(userId: number): Promise<number> {
  const result = await query(
    'UPDATE expiry_items SET archived_at = NOW() WHERE user_id = $1 AND archived_at IS NULL',
    [userId]
  );
  return result.rowCount ?? 0;
}

export async function getItemById(id: number): Promise<ExpiryItem | null> {
  const result = await query<ExpiryItem>(
    'SELECT * FROM expiry_items WHERE id = $1',
    [id]
  );
  const row = result.rows[0];
  return row ? decryptItem(row) : null;
}

export async function createItem(
  name: string,
  expiryDate: string,
  userId?: number
): Promise<ExpiryItem> {
  const encryptedName = encrypt(name);
  const result = await query<ExpiryItem>(
    'INSERT INTO expiry_items (name, expiry_date, user_id) VALUES ($1, $2, $3) RETURNING *',
    [encryptedName, expiryDate, userId ?? null]
  );
  return decryptItem(result.rows[0]);
}

export async function updateItem(
  id: number,
  name: string,
  expiryDate: string
): Promise<ExpiryItem | null> {
  const encryptedName = encrypt(name);
  const result = await query<ExpiryItem>(
    'UPDATE expiry_items SET name = $1, expiry_date = $2 WHERE id = $3 RETURNING *',
    [encryptedName, expiryDate, id]
  );
  const row = result.rows[0];
  return row ? decryptItem(row) : null;
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

export async function deleteAllArchivedItems(userId: number): Promise<number> {
  const result = await query(
    'DELETE FROM expiry_items WHERE user_id = $1 AND archived_at IS NOT NULL',
    [userId]
  );
  return result.rowCount ?? 0;
}
