import mysql from 'mysql2/promise';

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dbEduva',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection saat import
db.getConnection()
  .then(connection => {
    console.log(' Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error(' Database connection failed:', err.message);
  });

export default db;