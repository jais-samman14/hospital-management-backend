

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Simple configuration that works for both local and Railway
const dbConfig = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'hospital_management',
  port: process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// MySQL connection pool
let pool;

try {
  pool = mysql.createPool(dbConfig);
  console.log('✅ MySQL connection pool created successfully');
  console.log('🔗 Database:', dbConfig.database);
} catch (error) {
  console.error('❌ Failed to create MySQL connection pool:', error.message);
}


// Database connection test function
export const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL Database connected successfully');
        
        // Test query
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ Database test query successful',rows);
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

// Query execute function
export const query = async (sql, params = []) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('❌ Database query error:', error.message);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

export default pool;