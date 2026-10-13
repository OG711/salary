import { db } from './client.js';

export async function initDb() {
  console.log('Initializing database tables...');
  
  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
      color TEXT NOT NULL,
      icon TEXT
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
      category_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      note TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
    );
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
  `);

  const initialCategories = [
    // Expenses
    { name: 'Продукты', type: 'expense', color: '#EF4444', icon: 'ShoppingCart' },
    { name: 'Коммуналка', type: 'expense', color: '#F97316', icon: 'Home' },
    { name: 'Аренда', type: 'expense', color: '#8B5CF6', icon: 'Key' },
    { name: 'Транспорт', type: 'expense', color: '#3B82F6', icon: 'Car' },
    { name: 'Развлечения', type: 'expense', color: '#EC4899', icon: 'Film' },
    { name: 'Здоровье', type: 'expense', color: '#10B981', icon: 'Activity' },
    { name: 'Другое', type: 'expense', color: '#6B7280', icon: 'MoreHorizontal' },
    // Income
    { name: 'Зарплата', type: 'income', color: '#10B981', icon: 'Briefcase' },
    { name: 'Подработка', type: 'income', color: '#06B6D4', icon: 'Laptop' },
    { name: 'Проценты от вкладов', type: 'income', color: '#F59E0B', icon: 'Percent' },
    { name: 'Подарки', type: 'income', color: '#84CC16', icon: 'Gift' },
    { name: 'Другое', type: 'income', color: '#6B7280', icon: 'MoreHorizontal' },
  ];

  const existingRes = await db.execute('SELECT COUNT(*) as count FROM categories');
  const count = existingRes.rows[0]?.count ?? 0;

  if (Number(count) === 0) {
    console.log('Seeding default categories...');
    for (const cat of initialCategories) {
      await db.execute({
        sql: 'INSERT INTO categories (name, type, color, icon) VALUES (?, ?, ?, ?)',
        args: [cat.name, cat.type, cat.color, cat.icon],
      });
    }
    console.log(`Inserted ${initialCategories.length} categories.`);
  } else {
    console.log(`Categories table already contains ${count} records.`);
  }

  console.log('Database initialization completed.');
}

// If executed directly
if (process.argv[1]?.endsWith('seed.js')) {
  initDb()
    .then(() => {
      console.log('Seed script finished successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed script error:', err);
      process.exit(1);
    });
}
