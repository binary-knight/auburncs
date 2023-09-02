/**
 * This file contains all of the code to create a mysql connection
 */

const mysql = require('mysql2/promise');

// Create a MySQL connection pool
const createConnectionPool = async (credentials) => {
  try {
    // Create the MySQL connection pool
    pool = await mysql.createPool({
      host: credentials.host,
      user: credentials.user,
      password: credentials.password,
      database: credentials.database
    });

    return pool;
  } catch (error) {
    console.error('Error creating database connection pool:', error);
    throw error;
  }
};

// TODO: create method to grab a connection from the pool

// TODO: create method to close the connection

module.exports = { createConnectionPool };