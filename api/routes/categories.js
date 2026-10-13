import { Router } from 'express';
import { db } from '../db/client.js';

const router = Router();

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    let sql = 'SELECT id, name, type, color, icon FROM categories';
    const args = [];

    if (type && (type === 'income' || type === 'expense')) {
      sql += ' WHERE type = ?';
      args.push(type);
    }
    sql += ' ORDER BY id ASC';

    const result = await db.execute({ sql, args });
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/categories
router.post('/', async (req, res) => {
  try {
    const { name, type, color, icon } = req.body;

    if (!name || !type || !color) {
      return res.status(400).json({ error: 'name, type, and color are required' });
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ error: 'type must be income or expense' });
    }

    const insertRes = await db.execute({
      sql: 'INSERT INTO categories (name, type, color, icon) VALUES (?, ?, ?, ?)',
      args: [name.trim(), type, color.trim(), icon || 'MoreHorizontal'],
    });

    const newId = Number(insertRes.lastInsertRowid);
    const categoryRes = await db.execute({
      sql: 'SELECT id, name, type, color, icon FROM categories WHERE id = ?',
      args: [newId],
    });

    res.status(201).json(categoryRes.rows[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

export default router;
