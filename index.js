const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Rota para adicionar um produto
app.post('/product', async (req, res) => {
  const { category, name, quantity, price } = req.body;
  if (!category || !name || quantity === undefined || price === undefined) {
    return res.status(400).send('Category, name, quantity, and price are required.');
  }

  try {
    const result = await pool.query(
      'INSERT INTO products (category, name, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *',
      [category, name, quantity, price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Rota para obter produtos por categoria
app.get('/product', async (req, res) => {
  const { category } = req.query;
  if (!category) {
    return res.status(400).send('Category is required.');
  }

  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE category = $1',
      [category]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Rota para deletar um produto
app.delete('/product', async (req, res) => {
  const { category, name } = req.body;
  if (!category || !name) {
    return res.status(400).send('Category and name are required.');
  }

  try {
    const result = await pool.query(
      'DELETE FROM products WHERE category = $1 AND name = $2 RETURNING *',
      [category, name]
    );
    if (result.rowCount === 0) {
      return res.status(404).send('Product not found.');
    }
    res.status(200).send('Product deleted.');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
