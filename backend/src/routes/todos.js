import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET all todos
router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM todos ORDER BY created_at DESC');
  res.json(rows);
});

// POST create todo
router.post('/', async (req, res) => {
  const { title } = req.body;
  if (!title?.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const { rows } = await pool.query(
    'INSERT INTO todos (title) VALUES ($1) RETURNING *',
    [title.trim()]
  );
  res.status(201).json(rows[0]);
});

// PATCH toggle completed
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    'UPDATE todos SET completed = NOT completed WHERE id = $1 RETURNING *',
    [id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

// DELETE todo
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query('DELETE FROM todos WHERE id = $1', [id]);
  if (!rowCount) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

export default router;
