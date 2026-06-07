// savorsphere/server/test-db.js
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    // Create connection pool
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Test the connection
    const [rows] = await pool.query('SELECT 1 + 1 as result');
    console.log('Database connection successful!');
    console.log('Test query result:', rows[0].result);
    
    // Fetch sample data
    const [restaurants] = await pool.query('SELECT * FROM restaurants LIMIT 3');
    console.log('Sample restaurants:', restaurants);
    
    // Close the connection pool
    await pool.end();
    
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
}

// Run the test
testConnection().then(success => {
  if (success) {
    console.log('Database connection test completed successfully.');
  } else {
    console.log('Database connection test failed. Please check your configuration.');
  }
});
