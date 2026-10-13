import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import categoriesRouter from './routes/categories.js';
import transactionsRouter from './routes/transactions.js';
import analyticsRouter from './routes/analytics.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/categories', categoriesRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/analytics', analyticsRouter);

// Health check / root API route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// If run directly (e.g. node api/index.js or npm run dev:server)
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  // Only start listening if not running inside Vercel serverless wrapper
  app.listen(PORT, () => {
    console.log(`Finance Tracker API server running on port ${PORT}`);
  });
}

export default app;
