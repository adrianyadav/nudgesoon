import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { getPostgresPoolConfig } from '../lib/postgres-config';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrate() {
  console.log('🔄 Migrating: making password_hash nullable for OAuth users...\n');

  const pool = new Pool(getPostgresPoolConfig(process.env.POSTGRES_URL));

  try {
    await pool.query(`
      ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL
    `);
    console.log('✅ password_hash is now nullable.\n');
    console.log('🎉 Migration complete!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
