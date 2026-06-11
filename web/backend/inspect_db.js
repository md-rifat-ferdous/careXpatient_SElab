const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function main() {
  try {
    const udtRes = await pool.query(`
      SELECT udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'LabOrder' AND column_name = 'status'
    `);
    const udtName = udtRes.rows[0].udt_name;
    console.log('UDT Name for status column:', udtName);

    const enumRes = await pool.query(`
      SELECT enumlabel 
      FROM pg_enum 
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
      WHERE pg_type.typname = $1
    `, [udtName]);
    console.log('Enum labels:', enumRes.rows.map(r => r.enumlabel));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();
