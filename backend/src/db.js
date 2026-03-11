import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://todo_user:todo_pass@localhost:5433/todo_db',
});

export default pool;
