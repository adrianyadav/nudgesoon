import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { getPostgresPoolConfig } from '../lib/postgres-config';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrate() {
  console.log('🔄 Migrating: adding archived_at column to expiry_items...\n');

  const pool = new Pool(getPostgresPoolConfig(process.env.POSTGRES_URL));

  try {
    const columnCheck = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'expiry_items' AND column_name = 'archived_at'
    `);

    if (columnCheck.rows.length > 0) {
      console.log('✅ archived_at column already exists.\n');
      return;
    }

    await pool.query(`
      ALTER TABLE expiry_items
      ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
    `);
    console.log('✅ archived_at column added.\n');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_expiry_items_archived_at
      ON expiry_items(archived_at)
    `);
    console.log('✅ Index on archived_at created.\n');

    console.log('🎉 Migration complete!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
