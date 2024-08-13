const request = require('supertest');
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

describe('Product API', () => {
  beforeAll(async () => {
    await pool.query('CREATE TABLE IF NOT EXISTS products (id SERIAL PRIMARY KEY, category VARCHAR(50), name VARCHAR(100), quantity INTEGER DEFAULT 0, price DECIMAL(10, 2) DEFAULT 0.00)');
  });

  afterAll(async () => {
    await pool.query('DROP TABLE IF EXISTS products');
    await pool.end();
  });

  test('should add a product', async () => {
    const response = await request(app)
      .post('/product')
      .send({ category: 'banho', name: 'Sabonete', quantity: 10, price: 5.99 });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('category', 'banho');
    expect(response.body).toHaveProperty('name', 'Sabonete');
    expect(response.body).toHaveProperty('quantity', 10);
    expect(response.body).toHaveProperty('price', '5.99');
  });

  test('should get products by category', async () => {
    await request(app).post('/product').send({ category: 'banho', name: 'Shampoo', quantity: 20, price: 10.99 });
    const response = await request(app).get('/product').query({ category: 'banho' });
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'Shampoo', quantity: 20, price: '10.99' }),
    ]));
  });

  test('should delete a product', async () => {
    await request(app).post('/product').send({ category: 'banho', name: 'Creme', quantity: 5, price: 7.99 });
    const response = await request(app)
      .delete('/product')
      .send({ category: 'banho', name: 'Creme' });
    expect(response.status).toBe(200);
    expect(response.text).toBe('Product deleted.');
  });
});
