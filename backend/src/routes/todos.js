import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET all todos
router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM todos ORDER BY position ASC');
  res.json(rows);
});

// POST create todo
router.post('/', async (req, res) => {
  const { title } = req.body;
  if (!title?.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const { rows: [{ max_pos }] } = await pool.query(
    'SELECT COALESCE(MAX(position), 0) AS max_pos FROM todos'
  );
  const { rows } = await pool.query(
    'INSERT INTO todos (title, position) VALUES ($1, $2) RETURNING *',
    [title.trim(), max_pos + 1]
  );
  res.status(201).json(rows[0]);
});

// PATCH reorder — must come before /:id
router.patch('/reorder', async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || !ids.length) {
    return res.status(400).json({ error: 'ids array required' });
  }
  await pool.query(
    `UPDATE todos SET position = updates.pos
     FROM (
       SELECT unnest($1::int[]) AS id,
              generate_series(1, $2) AS pos
     ) AS updates
     WHERE todos.id = updates.id`,
    [ids, ids.length]
  );
  const { rows } = await pool.query('SELECT * FROM todos ORDER BY position ASC');
  res.json(rows);
});

// PATCH toggle completed or update title
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  let result;
  if (title !== undefined) {
    if (!title.trim()) return res.status(400).json({ error: 'Title is required' });
    result = await pool.query(
      'UPDATE todos SET title = $1 WHERE id = $2 RETURNING *',
      [title.trim(), id]
    );
  } else {
    result = await pool.query(
      'UPDATE todos SET completed = NOT completed WHERE id = $1 RETURNING *',
      [id]
    );
  }
  if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
});

// DELETE todo
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query('DELETE FROM todos WHERE id = $1', [id]);
  if (!rowCount) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

export default router;
