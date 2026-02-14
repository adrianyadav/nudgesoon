import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { encrypt } from '../lib/encryption';
import { getPostgresPoolConfig } from '../lib/postgres-config';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const PREFIX = 'enc:v1:';

async function migrate() {
  console.log('🔐 Running migration to encrypt expiry item names...\n');

  const pool = new Pool(getPostgresPoolConfig(process.env.POSTGRES_URL));

  try {
    console.log('📡 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!\n');

    console.log('📋 Altering name column to TEXT if needed...');
    await pool.query(`
      ALTER TABLE expiry_items
      ALTER COLUMN name TYPE TEXT
    `);
    console.log('✅ Column type updated.\n');

    const { rows } = await pool.query<{ id: number; name: string }>(
      'SELECT id, name FROM expiry_items'
    );

    let encrypted = 0;
    for (const row of rows) {
      if (!row.name.startsWith(PREFIX)) {
        const encryptedName = encrypt(row.name);
        await pool.query('UPDATE expiry_items SET name = $1 WHERE id = $2', [
          encryptedName,
          row.id,
        ]);
        encrypted++;
      }
    }

    console.log(`✅ Encrypted ${encrypted} item(s).\n`);
    console.log('🎉 Migration complete!\n');
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
