/**
 * Migration: 001_create_leads
 *
 * Creates the leads table for storing institution sign-up data.
 * Run with: pnpm --filter backend migrate
 */

import { pool } from '../src/db/postgres';

async function up(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id            VARCHAR(64)   PRIMARY KEY,
        email         VARCHAR(255)  NOT NULL,
        phone         VARCHAR(20),
        institution_name  VARCHAR(255)  NOT NULL,
        institution_type  VARCHAR(50)   NOT NULL CHECK (institution_type IN ('Bank', 'NBFC', 'MFI', 'Credit Union', 'Fintech', 'Insurance', 'Other')),
        city          VARCHAR(100)  NOT NULL,
        loan_book_size    VARCHAR(50)   NOT NULL,
        status        VARCHAR(20)   NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'converted', 'rejected')),
        created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
      );
    `);

    // Index for email lookups (common query pattern)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email);
    `);

    // Index for status filtering (used in admin/CRM views)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
    `);

    // Auto-update updated_at on row change
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
      CREATE TRIGGER update_leads_updated_at
        BEFORE UPDATE ON leads
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query('COMMIT');
    console.log('[migration] 001_create_leads: OK');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function down(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DROP TABLE IF EXISTS leads CASCADE;');
    await client.query('DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;');
    await client.query('COMMIT');
    console.log('[migration] 001_create_leads: rolled back');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Run migration
const action = process.argv[2];
if (action === 'down') {
  down()
    .then(() => process.exit(0))
    .catch((err) => { console.error(err); process.exit(1); });
} else {
  up()
    .then(() => process.exit(0))
    .catch((err) => { console.error(err); process.exit(1); });
}
