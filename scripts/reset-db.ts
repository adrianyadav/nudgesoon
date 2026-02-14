import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { getPostgresPoolConfig } from '../lib/postgres-config';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function resetDatabase() {
  console.log('🔄 Resetting database...\n');

  const pool = new Pool(getPostgresPoolConfig(process.env.POSTGRES_URL));

  try {
    console.log('📡 Connecting...');
    await pool.query('SELECT NOW()');
    console.log('✅ Connected.\n');

    console.log('🗑️  Dropping tables...');
    await pool.query('DROP TABLE IF EXISTS expiry_items CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    console.log('✅ Tables dropped.\n');

    console.log('📋 Creating users table...');
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('📋 Creating expiry_items table...');
    await pool.query(`
      CREATE TABLE expiry_items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        expiry_date DATE NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('🔍 Creating indexes...');
    await pool.query(`
      CREATE INDEX idx_expiry_items_expiry_date ON expiry_items(expiry_date)
    `);
    await pool.query(`
      CREATE INDEX idx_expiry_items_user_id ON expiry_items(user_id)
    `);
    await pool.query(`
      CREATE INDEX idx_users_email ON users(email)
    `);

    console.log('⚙️  Creating trigger...');
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    await pool.query(`
      DROP TRIGGER IF EXISTS update_expiry_items_updated_at ON expiry_items
    `);
    await pool.query(`
      CREATE TRIGGER update_expiry_items_updated_at
      BEFORE UPDATE ON expiry_items
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    `);

    console.log('\n🎉 Database reset complete. Run `npm run seed` to add sample data.\n');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetDatabase();
