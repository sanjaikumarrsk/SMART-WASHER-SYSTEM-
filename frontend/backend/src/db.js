// MySQL connection disabled - using SQL Server via .NET API instead
const pool = null;

let isDbAvailable = false;

async function testConnection() {
  // SQL Server is accessed via .NET API - local MySQL connection not needed
  console.log('✓ Using SQL Server via .NET API (https://localhost:7099/api/Data)');
  isDbAvailable = false;
}

function dbAvailable() {
  return isDbAvailable;
}

module.exports = { pool, testConnection, dbAvailable };
