require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: 'postgres', // Start by connecting to default postgres DB
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

async function init() {
  try {
    // Create database if it doesn't exist
    await pool.query('CREATE DATABASE carexpatient').catch(e => {
        if (e.code === '42P04') {
            console.log('Database carexpatient already exists');
        } else {
            throw e;
        }
    });
    await pool.end();

    // Now connect to carexpatient DB
    const carexPool = new Pool({
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        database: 'carexpatient',
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT,
    });

    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await carexPool.query(schema);
    console.log('Schema migration successful');
    await carexPool.end();
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

init();
