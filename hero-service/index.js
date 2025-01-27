const express = require('express');
const { Pool } = require('pg');
const app = express();
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'hero-db',
  database: 'hero',
  password: 'postgres',
  port: 5432,
});

app.get('/heroes', async (req, res) => {
  const result = await pool.query('SELECT * FROM heroes');
  res.json(result.rows);
});

app.post('/heroes', async (req, res) => {
  const { name } = req.body;
  const result = await pool.query(
    'INSERT INTO heroes (name, level, health) VALUES ($1, 1, 100) RETURNING *',
    [name]
  );
  res.json(result.rows[0]);
});

app.listen(3002, () => {
  console.log('Hero Service running on port 3002');
});