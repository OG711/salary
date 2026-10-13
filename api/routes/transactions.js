import { Router } from 'express';
import { db } from '../db/client.js';

const router = Router();

// GET /api/transactions
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, type, categoryId, limit = 50, offset = 0 } = req.query;

    let sql = `
      SELECT 
        transactions.id,
        transactions.amount,
        transactions.type,
        transactions.category_id,
        categories.name AS category_name,
        categories.color AS category_color,
        categories.icon AS category_icon,
        transactions.date,
        transactions.note,
        transactions.created_at
      FROM transactions
      LEFT JOIN categories ON transactions.category_id = categories.id
      WHERE 1=1
    `;
    const args = [];

    if (startDate) {
      sql += ' AND transactions.date >= ?';
      args.push(startDate);
    }
    if (endDate) {
      sql += ' AND transactions.date <= ?';
      args.push(endDate);
    }
    if (type && (type === 'income' || type === 'expense')) {
      sql += ' AND transactions.type = ?';
      args.push(type);
    }
    if (categoryId) {
      sql += ' AND transactions.category_id = ?';
      args.push(Number(categoryId));
    }

    sql += ' ORDER BY transactions.date DESC, transactions.id DESC LIMIT ? OFFSET ?';
    args.push(Number(limit), Number(offset));

    const result = await db.execute({ sql, args });
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// POST /api/transactions
router.post('/', async (req, res) => {
  try {
    const { amount, type, category_id, date, note = '' } = req.body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'amount must be a number greater than 0' });
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ error: 'type must be income or expense' });
    }

    if (!category_id) {
      return res.status(400).json({ error: 'category_id is required' });
    }

    // Verify category exists
    const catCheck = await db.execute({
      sql: 'SELECT id FROM categories WHERE id = ?',
      args: [category_id],
    });

    if (catCheck.rows.length === 0) {
      return res.status(400).json({ error: 'category_id does not exist' });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!date || !dateRegex.test(date)) {
      return res.status(400).json({ error: 'date must be in YYYY-MM-DD format' });
    }

    const insertRes = await db.execute({
      sql: `
        INSERT INTO transactions (amount, type, category_id, date, note)
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [numAmount, type, category_id, date, note || ''],
    });

    const newId = Number(insertRes.lastInsertRowid);
    const result = await db.execute({
      sql: `
        SELECT 
          transactions.id,
          transactions.amount,
          transactions.type,
          transactions.category_id,
          categories.name AS category_name,
          categories.color AS category_color,
          categories.icon AS category_icon,
          transactions.date,
          transactions.note,
          transactions.created_at
        FROM transactions
        LEFT JOIN categories ON transactions.category_id = categories.id
        WHERE transactions.id = ?
      `,
      args: [newId],
    });

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// PUT /api/transactions/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, category_id, date, note } = req.body;

    const existingRes = await db.execute({
      sql: 'SELECT * FROM transactions WHERE id = ?',
      args: [id],
    });

    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const current = existingRes.rows[0];
    const newAmount = amount !== undefined ? parseFloat(amount) : current.amount;
    const newType = type !== undefined ? type : current.type;
    const newCategoryId = category_id !== undefined ? category_id : current.category_id;
    const newDate = date !== undefined ? date : current.date;
    const newNote = note !== undefined ? note : current.note;

    if (isNaN(newAmount) || newAmount <= 0) {
      return res.status(400).json({ error: 'amount must be a number greater than 0' });
    }
    if (newType !== 'income' && newType !== 'expense') {
      return res.status(400).json({ error: 'type must be income or expense' });
    }
    if (newDate && !/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      return res.status(400).json({ error: 'date must be in YYYY-MM-DD format' });
    }

    await db.execute({
      sql: `
        UPDATE transactions
        SET amount = ?, type = ?, category_id = ?, date = ?, note = ?
        WHERE id = ?
      `,
      args: [newAmount, newType, newCategoryId, newDate, newNote, id],
    });

    const result = await db.execute({
      sql: `
        SELECT 
          transactions.id,
          transactions.amount,
          transactions.type,
          transactions.category_id,
          categories.name AS category_name,
          categories.color AS category_color,
          categories.icon AS category_icon,
          transactions.date,
          transactions.note,
          transactions.created_at
        FROM transactions
        LEFT JOIN categories ON transactions.category_id = categories.id
        WHERE transactions.id = ?
      `,
      args: [id],
    });

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingRes = await db.execute({
      sql: 'SELECT id FROM transactions WHERE id = ?',
      args: [id],
    });

    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await db.execute({
      sql: 'DELETE FROM transactions WHERE id = ?',
      args: [id],
    });

    res.json({ success: true, deletedId: Number(id) });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

export default router;
