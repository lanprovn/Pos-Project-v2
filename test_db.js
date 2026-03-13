const { Client } = require('pg');
const client = new Client({
  connectionString: "postgresql://postgres.oacpzurqwmwialgxfosb:ev5w7TY0YrVlTwVy@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
});

async function test() {
  try {
    const table = process.argv[2] || 'User';
    console.log(`Connecting to check table: ${table}...`);
    await client.connect();
    const res = await client.query(`SELECT count(*) FROM "${table}"`);
    console.log(`Count in ${table}:`, res.rows[0].count);
    await client.end();
  } catch (err) {
    if (err.code === '42P01') {
      console.log('Table does not exist yet.');
    } else {
      console.error('Error:', err.message);
    }
    process.exit(1);
  }
}

test();
