const express = require('express');
const https = require('https');
const fs = require('fs');
const mysql = require('mysql2');
const cors = require('cors');
const morgan = require('morgan');
const AWS = require('aws-sdk');

const app = express();
const port = 3000;

// Set the AWS region
process.env.AWS_REGION = 'us-east-1';

// Use morgan middleware for logging
app.use(morgan('combined')); // 'combined' is a pre-defined log format

const ssm = new AWS.SSM();

// Retrieve the parameter value from Systems Manager
const getDatabaseCredentials = async () => {
  const parameterName = '/auburncs/database_credentials';

  const params = {
    Name: parameterName,
    WithDecryption: true
  };

  try {
    const response = await ssm.getParameter(params).promise();
    return JSON.parse(response.Parameter.Value);
  } catch (error) {
    console.error('Error retrieving database credentials:', error);
    throw error;
  }
};

// Create a MySQL connection pool
const createConnectionPool = async () => {
  try {
    const credentials = await getDatabaseCredentials();

    // Create the MySQL connection pool
    const pool = mysql.createPool({
      host: credentials.host,
      user: credentials.user,
      password: credentials.password,
      database: credentials.database
    });

    return pool.promise();
  } catch (error) {
    console.error('Error creating database connection pool:', error);
    throw error;
  }
};

// SSL/TLS certificate options
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/auburnonlinecs.com-0001/privkey.pem'), // Path to your private key file
  cert: fs.readFileSync('/etc/letsencrypt/live/auburnonlinecs.com-0001/fullchain.pem') // Path to your certificate file
};

app.use(cors());
app.use(express.json()); // Parse JSON request bodies

// Route for getting all classes
app.get('/classes', async (req, res) => {
  console.log('Attempting to retrieve classes...');

  try {
    // Get the MySQL connection pool
    const pool = await createConnectionPool();

    // Execute the MySQL query to retrieve all classes
    const [rows, fields] = await pool.query('SELECT * FROM classes');
    res.json(rows);
  } catch (error) {
    console.error('Error retrieving classes:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Route for deleting a class
app.delete('/classes/:id', async (req, res) => {
  const classId = req.params.id;

  try {
    // Get the MySQL connection pool
    const pool = await createConnectionPool();

    // Perform the necessary logic to delete the class from the database
    const [result] = await pool.query('DELETE FROM classes WHERE id = ?', [classId]);

    if (result.affectedRows > 0) {
      // Class deleted successfully
      res.sendStatus(204); // Send a 204 No Content response
    } else {
      // Class not found or no rows affected
      res.status(404).json({ error: 'Class not found' });
    }
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


// Route for updating a class
app.put('/classes/:id', async (req, res) => {
  const classId = req.params.id;
  const updatedClassData = req.body;

  try {
    // Get the MySQL connection pool
    const pool = await createConnectionPool();

    // Perform the necessary logic to update the class in the database
    const [result] = await pool.query(
      'UPDATE classes SET name = ?, difficulty = ?, quality = ?, hpw = ?, description = ?, syllabus = ? WHERE id = ?',
      [
        updatedClassData.name,
        updatedClassData.difficulty,
        updatedClassData.quality,
        updatedClassData.hpw,
        updatedClassData.description,
        updatedClassData.syllabus,
        classId
      ]
    );

    if (result.affectedRows > 0) {
      // Class updated successfully
      res.json(updatedClassData);
    } else {
      // Class not found or no rows affected
      res.status(404).json({ error: 'Class not found' });
    }
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Route for adding a new class
app.post('/classes', async (req, res) => {
  const { name, difficulty, quality, hpw, description, syllabus } = req.body;

  try {
    // Get the MySQL connection pool
    const pool = await createConnectionPool();

    // Perform the necessary logic to add the class to the database
    const [result] = await pool.query(
      'INSERT INTO classes (name, difficulty, quality, hpw, description, syllabus) VALUES (?, ?, ?, ?, ?, ?)',
      [name, difficulty, quality, hpw, description, syllabus]
    );

    if (result.affectedRows > 0) {
      // Class added successfully
      res.sendStatus(201); // Send a 201 Created response
    } else {
      // No rows affected
      console.error('Failed to add class:', result);
      res.status(500).json({ error: 'Failed to add class' });
    }
  } catch (error) {
    console.error('Error adding class:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Route for voting on a class
app.post('/classes/:id/vote', async (req, res) => {
  const classId = req.params.id;
  const { difficulty, quality, hpw } = req.body;

  try {
    // Get the MySQL connection pool
    const pool = await createConnectionPool();

    // Perform the necessary logic to update the class statistics with the vote data
    const [result] = await pool.query(
      'SELECT difficulty, quality, hpw, votes FROM classes WHERE id = ?',
      [classId]
    );

    if (result.length > 0) {
      const currentDifficulty = result[0].difficulty;
      const currentQuality = result[0].quality;
      const currentHPW = result[0].hpw;
      const currentVotes = result[0].votes;

      // Calculate the new statistics based on the vote data and the existing values
      const newDifficulty = (currentDifficulty * currentVotes + difficulty) / (currentVotes + 1);
      const newQuality = (currentQuality * currentVotes + quality) / (currentVotes + 1);
      const newHPW = (currentHPW * currentVotes + hpw) / (currentVotes + 1);
      const newVotes = currentVotes + 1;

      // Update the class statistics in the database
      const [updateResult] = await pool.query(
        'UPDATE classes SET difficulty = ?, quality = ?, hpw = ?, votes = ? WHERE id = ?',
        [newDifficulty, newQuality, newHPW, newVotes, classId]
      );

      if (updateResult.affectedRows > 0) {
        // Class statistics updated successfully
        res.sendStatus(200); // Send a 200 OK response
      } else {
        // Class not found or no rows affected
        res.status(404).json({ error: 'Class not found' });
      }
    } else {
      // Class not found
      res.status(404).json({ error: 'Class not found' });
    }
  } catch (error) {
    console.error('Error voting on class:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.put('/classes/:id/clear-stats', async (req, res) => {
  const classId = req.params.id;

  try {
    // Get the MySQL connection pool
    const pool = await createConnectionPool();

    // Perform the necessary logic to clear the stats of the class in the database
    const [result] = await pool.query(
      'UPDATE classes SET difficulty = 0, quality = 0, hpw = 0, votes = 0 WHERE id = ?',
      [classId]
    );

    if (result.affectedRows > 0) {
      // Stats cleared successfully
      res.sendStatus(200); // Send a 200 OK response
    } else {
      // Class not found or no rows affected
      res.status(404).json({ error: 'Class not found' });
    }
  } catch (error) {
    console.error('Error clearing class stats:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/classes/:id/details', async (req, res) => {
  const classId = req.params.id;

  try {
    // Get the MySQL connection pool
    const pool = await createConnectionPool();

    // Fetch the class details from the database based on the classId
    const [results] = await pool.query(
      'SELECT id, name, quality, hpw, difficulty, description, syllabus FROM classes WHERE id = ?',
      [classId]
    );

    if (results.length > 0) {
      const classDetails = results[0];
      res.json(classDetails);
    } else {
      res.status(404).json({ error: 'Class not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


// Create an HTTPS server
const server = https.createServer(options, app);

// Start the server
server.listen(port, () => {
  console.log(`Server listening at https://localhost:${port}`);
});


