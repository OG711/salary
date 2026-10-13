import { Router } from 'express';
import { db } from '../db/client.js';

const router = Router();

// GET /api/analytics/summary
router.get('/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const dateArgs = [];

    if (startDate) {
      dateFilter += ' AND transactions.date >= ?';
      dateArgs.push(startDate);
    }
    if (endDate) {
      dateFilter += ' AND transactions.date <= ?';
      dateArgs.push(endDate);
    }

    // Total income
    const incomeSql = `
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM transactions
      WHERE type = 'income' ${dateFilter}
    `;
    const incomeRes = await db.execute({ sql: incomeSql, args: dateArgs });
    const totalIncome = Number(incomeRes.rows[0]?.total || 0);

    // Total expense
    const expenseSql = `
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM transactions
      WHERE type = 'expense' ${dateFilter}
    `;
    const expenseRes = await db.execute({ sql: expenseSql, args: dateArgs });
    const totalExpense = Number(expenseRes.rows[0]?.total || 0);

    const netBalance = totalIncome - totalExpense;

    // Expenses by category
    const byCategorySql = `
      SELECT 
        transactions.category_id AS categoryId,
        categories.name AS name,
        categories.color AS color,
        categories.icon AS icon,
        SUM(transactions.amount) AS total
      FROM transactions
      INNER JOIN categories ON transactions.category_id = categories.id
      WHERE transactions.type = 'expense' ${dateFilter}
      GROUP BY transactions.category_id, categories.name, categories.color, categories.icon
      ORDER BY total DESC
    `;
    const byCategoryRes = await db.execute({ sql: byCategorySql, args: dateArgs });

    const byCategory = byCategoryRes.rows.map((row) => ({
      categoryId: row.categoryId,
      name: row.name,
      color: row.color,
      icon: row.icon,
      total: Number(row.total || 0),
    }));

    res.json({
      totalIncome,
      totalExpense,
      netBalance,
      byCategory,
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({ error: 'Failed to fetch analytics summary' });
  }
});

export default router;
