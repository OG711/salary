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

// Support both with and without /api prefix for Vercel rewrites compatibility
app.use('/api/categories', categoriesRouter);
app.use('/categories', categoriesRouter);

app.use('/api/transactions', transactionsRouter);
app.use('/transactions', transactionsRouter);

app.use('/api/analytics', analyticsRouter);
app.use('/analytics', analyticsRouter);

// Health check endpoints
const healthHandler = (req, res) => {
  res.json({
    status: 'ok',
    tursoConfigured: Boolean(process.env.TURSO_DATABASE_URL),
    timestamp: new Date().toISOString(),
  });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);
app.get('/api', healthHandler);
app.get('/', healthHandler);

// Only listen locally, never in Vercel Serverless environment
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Finance Tracker API server running on port ${PORT}`);
  });
}

export default app;
