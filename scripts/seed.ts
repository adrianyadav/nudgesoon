import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { encrypt } from '../lib/encryption';
import { getPostgresPoolConfig } from '../lib/postgres-config';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const DEMO_EMAIL = 'demo@example.com';
const DEMO_PASSWORD = 'demo1234';
const DEMO_NAME = 'Demo User';

const SAMPLE_ITEMS: { name: string; expiry_date: string }[] = [
  { name: 'Passport', expiry_date: '2028-06-15' },
  { name: 'Gym membership', expiry_date: getDateDaysFromNow(5) },
  { name: 'Milk', expiry_date: getDateDaysFromNow(1) },
  { name: 'Laptop warranty', expiry_date: '2026-12-31' },
  { name: 'Driving licence', expiry_date: '2027-03-20' },
  { name: 'Netflix subscription', expiry_date: getDateDaysFromNow(4) },
  { name: 'Medicine', expiry_date: getDateDaysFromNow(10) },
  { name: 'Car insurance', expiry_date: '2026-06-01' },
];

function getDateDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

async function seed() {
  console.log('🌱 Seeding database...\n');

  const pool = new Pool(getPostgresPoolConfig(process.env.POSTGRES_URL));

  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Connected.\n');

    const { rows: existing } = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [DEMO_EMAIL]
    );
    if (existing.length > 0) {
      console.log(`⚠️  User ${DEMO_EMAIL} already exists. Skipping user creation.`);
      console.log('   Delete the user first if you want to re-seed (e.g. run reset-db then seed).\n');
    } else {
      console.log('👤 Creating demo user...');
      const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
      const { rows: users } = await pool.query(
        `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id`,
        [DEMO_EMAIL, passwordHash, DEMO_NAME]
      );
      const userId = users[0].id;
      console.log(`   Email: ${DEMO_EMAIL}`);
      console.log(`   Password: ${DEMO_PASSWORD}\n`);

      console.log('📦 Inserting sample expiry items...');
      for (let i = 0; i < SAMPLE_ITEMS.length; i++) {
        const { name, expiry_date } = SAMPLE_ITEMS[i];
        const encryptedName = encrypt(name);
        await pool.query(
          `INSERT INTO expiry_items (name, expiry_date, user_id) VALUES ($1, $2, $3)`,
          [encryptedName, expiry_date, userId]
        );
        console.log(`   ${i + 1}. ${name} (${expiry_date})`);
      }
      console.log('\n🎉 Seed complete.');
    }

    console.log('\n   Sign in at /auth/signin with the demo account to see the items.\n');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
