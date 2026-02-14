import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { getPostgresPoolConfig } from '../lib/postgres-config';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrate() {
  console.log('🚀 Running migration to add users...\n');

  const pool = new Pool(getPostgresPoolConfig(process.env.POSTGRES_URL));

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!\n');

    // Create users table if it doesn't exist
    console.log('📋 Creating users table if not exists...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table ready!\n');

    // Check if user_id column exists
    const columnCheck = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'expiry_items' AND column_name = 'user_id'
    `);

    if (columnCheck.rows.length === 0) {
      console.log('📋 Adding user_id column to expiry_items...');
      await pool.query(`
        ALTER TABLE expiry_items
        ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
      `);
      console.log('✅ user_id column added!\n');
    } else {
      console.log('✅ user_id column already exists!\n');
    }

    // Create indexes
    console.log('🔍 Creating indexes if not exist...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_expiry_items_user_id
      ON expiry_items(user_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email
      ON users(email)
    `);
    console.log('✅ Indexes created!\n');

    // Create trigger for users table
    console.log('⚙️  Creating auto-update trigger for users...');
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users
    `);

    await pool.query(`
      CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    `);
    console.log('✅ Trigger created!\n');

    console.log('🎉 Migration complete!\n');

  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
