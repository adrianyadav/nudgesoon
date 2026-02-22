import * as dotenv from 'dotenv';
import * as path from 'path';
import { Pool } from 'pg';
import { getPostgresPoolConfig } from '../lib/postgres-config';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const pool = new Pool(getPostgresPoolConfig(process.env.POSTGRES_URL));
  const { rows } = await pool.query(
    `SELECT ei.name, ei.expiry_date, ei.archived_at
     FROM expiry_items ei
     JOIN users u ON u.id = ei.user_id
     WHERE u.email = 'demo@example.com'
     ORDER BY ei.expiry_date`
  );
  console.log(JSON.stringify(rows, null, 2));
  await pool.end();
}

main();
