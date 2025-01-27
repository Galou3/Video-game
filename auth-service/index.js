const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'auth-db',
  database: 'auth',
  password: 'postgres',
  port: 5432,
});

app.post('/auth/register', async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query(
    'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
    [username, password]
  );
  res.json(result.rows[0]);
});

app.listen(3001, () => {
  console.log('Auth Service running on port 3001');
});