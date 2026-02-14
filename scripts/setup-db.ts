import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { getPostgresPoolConfig } from '../lib/postgres-config';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function setupDatabase() {
  console.log('🚀 Setting up database...\n');

  const pool = new Pool(getPostgresPoolConfig(process.env.POSTGRES_URL));

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!\n');

    // Create users table
    console.log('📋 Creating users table...');
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
    console.log('✅ Users table created successfully!\n');

    // Create expiry_items table
    console.log('📋 Creating expiry_items table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS expiry_items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        expiry_date DATE NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Expiry items table created successfully!\n');

    // Create indexes
    console.log('🔍 Creating indexes...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_expiry_items_expiry_date
      ON expiry_items(expiry_date)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_expiry_items_user_id
      ON expiry_items(user_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email
      ON users(email)
    `);
    console.log('✅ Indexes created successfully!\n');

    // Create trigger function (optional but good to have)
    console.log('⚙️  Creating auto-update trigger...');
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
      DROP TRIGGER IF EXISTS update_expiry_items_updated_at ON expiry_items
    `);

    await pool.query(`
      CREATE TRIGGER update_expiry_items_updated_at
      BEFORE UPDATE ON expiry_items
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    `);
    console.log('✅ Trigger created successfully!\n');

    console.log('🎉 Database setup complete! You can now run your app with: npm run dev\n');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
