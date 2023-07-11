const express = require('express');
const https = require('https');
const fs = require('fs');
const mysql = require('mysql2');
const cors = require('cors');
const morgan = require('morgan');
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const app = express();
const port = 3000;
const path = require('path');
const sslRedirect = require('express-sslify');

// Set the AWS region
process.env.AWS_REGION = 'us-east-1';

// Use morgan middleware for logging
app.use(morgan('combined')); // 'combined' is a pre-defined log format

// Force HTTP requests to redirect to HTTPS
app.use(sslRedirect.HTTPS({ trustProtoHeader: true }));

app.use(cors({
  origin: 'https://dev.auburnonlinecs.com', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Authorization', 'Content-Type'],
}));

app.use(express.json()); // Parse JSON request bodies

const ssm = new AWS.SSM();

// Retrieve the parameter value from Systems Manager
const getSecretKey = async () => {
  const parameterName = '/auburncs/jwtSecretKey';

  const params = {
    Name: parameterName,
    WithDecryption: true
  };

  try {
    const response = await ssm.getParameter(params).promise();
    return response.Parameter.Value;
  } catch (error) {
    console.error('Error retrieving secret key:', error);
    throw error;
  }
};

let secretKey;

async function initialize() {
  try {
    secretKey = await getSecretKey();
  } catch (error) {
    console.error('Error initializing secret key:', error);
  }
}

initialize();


const extractToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    const token = req.headers.authorization.split(' ')[1];
    return token;
  }
  return null;
};

app.use(
  expressJwt({ secret: () => secretKey, algorithms: ['HS256'], getToken: extractToken }).unless((req) => {
    const excludedPaths = ['/login', '/register', '/classes', '/user', '/users', '/classes/:id', '/users/:id', ];
    console.log(`Received ${req.method} request for ${req.path}`);
    if (req.method === 'OPTIONS') {
      console.log('Skipping JWT check for OPTIONS request');
      return true;
    }

    if (req.path.startsWith('/classes/') && req.method === 'GET') {
      console.log('Skipping JWT check for GET class details request');
      excludedPaths.push(req.path);
    }
    if (req.path.startsWith('/classes/') && req.path.endsWith('/vote') && req.method === 'POST') {
      console.log('Skipping JWT check for POST class vote request');
      return true;
    }
    if (req.path.startsWith('/users/') && req.method === 'DELETE') {
      console.log('Skipping JWT check for DELETE user request');
      return true;
    }
    if (req.method === 'DELETE' && req.path.startsWith('/classes/')) {
      const classId = req.params.id;
      console.log(`Skipping JWT check for DELETE class request with ID ${classId}`);
      return true;
    }
    if (req.method === 'PUT' && req.path.startsWith('/classes/')) {
      const classId = req.params.id;
      console.log(`Skipping JWT check for PUT class request with ID ${classId}`);
      return true;
    }
    if (req.method === 'PUT' && req.path.startsWith('/users/') && req.path.endsWith('/promote')) {
      const userId = req.params.id;
      console.log(`Skipping JWT check for PUT user promotion request with ID ${userId}`);
      return true;
    }
    if (req.method === 'PUT' && req.path.startsWith('/users/')) {
      const userId = req.params.id;
      console.log(`Skipping JWT check for PUT user request with ID ${userId}`);
      return true;
    }
    const excluded = excludedPaths.includes(req.path);
    if (excluded) {
      console.log('Skipping JWT check for excluded path');
    }
    return excluded;
  })
);

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

// Retrieve the parameter value from Systems Manager
const getSSLCertificateOptions = async () => {
  const parameterNames = ['/auburncs/sslPrivateKeyPath', '/auburncs/sslCertificatePath'];

  const params = {
    Names: parameterNames,
    WithDecryption: true
  };

  try {
    const response = await ssm.getParameters(params).promise();
    const privateKeyPath = response.Parameters.find(p => p.Name === parameterNames[0]).Value;
    const certificatePath = response.Parameters.find(p => p.Name === parameterNames[1]).Value;

    return {
      key: fs.readFileSync(privateKeyPath),
      cert: fs.readFileSync(certificatePath)
    };
  } catch (error) {
    console.error('Error retrieving SSL certificate options:', error);
    throw error;
  }
};

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
  console.log(`Received DELETE request for class ID ${req.params.id}`);

  const classId = req.params.id;

  try {
    // Get the MySQL connection pool
    const pool = await createConnectionPool();

    // Perform the necessary logic to delete the class from the database
    const [result] = await pool.query('DELETE FROM classes WHERE id = ?', [classId]);

    if (result.affectedRows > 0) {
      // Class deleted successfully
      console.log(`Class ID ${classId} deleted successfully`);
      res.sendStatus(204); // Send a 204 No Content response
    } else {
      // Class not found or no rows affected
      console.log(`No class found with ID ${classId}`);
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

// Function to fetch the username from the database based on the userId
const fetchUsernameFromDatabase = async (userId) => {
  try {
    // Get the MySQL connection pool
    const pool = await createConnectionPool();

    // Replace this with your actual database query logic
    const [results] = await pool.query('SELECT username FROM users WHERE id = ?', [userId]);
    if (results.length > 0) {
      return results[0].username;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching username from database:', error);
    throw error;
  }
};

// Function to fetch all users from the database
const fetchAllUsersFromDatabase = async () => {
  try {
    // Get the MySQL connection pool
    const pool = await createConnectionPool();

    // Query to fetch all users
    const [results] = await pool.query('SELECT * FROM users');
    return results;
  } catch (error) {
    console.error('Error fetching users from database:', error);
    throw error;
  }
};

app.get('/users', async (req, res) => {
  // Fetch all users from the database
  try {
    const users = await fetchAllUsersFromDatabase();

    if (users) {
      res.json({ users });
    } else {
      console.log('No users found');
      res.status(404).json({ error: 'No users found' });
    }
  } catch (dbError) {
    console.error('Error fetching users from database:', dbError);
    res.status(500).json({ error: 'Database error', details: dbError.message });
  }
});

app.put('/users/:id', async (req, res) => {
  const userId = req.params.id;
  const updatedUser = req.body;

  try {
    
    const [results] = await pool.query('UPDATE users SET username = ?, isadmin = ?, email = ?, realName = ? WHERE id = ?', [updatedUser.username, updatedUser.isadmin, updatedUser.email, updatedUser.realName, userId]);
    res.json(results);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// Route for deleting a user
app.delete('/users/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    // Get the MySQL connection pool
    const pool = await createConnectionPool();

    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [userId]);

    if (result.affectedRows > 0) {
      // User deleted successfully
      res.sendStatus(204); // Send a 204 No Content response
    } else {
      // User not found or no rows affected
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.put('/users/:id/promote', async (req, res) => {
  const userId = req.params.id;

  try {
    // Get the MySQL connection pool
    const pool = await createConnectionPool();

    // Check if the user exists in the database
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the user's isAdmin property to true
    await pool.query('UPDATE users SET isAdmin = true WHERE id = ?', [userId]);

    // Send a response indicating successful promotion
    res.json({ message: 'User promoted successfully' });
  } catch (error) {
    console.error('Error promoting user:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

app.get('/user', async (req, res) => {
  const token = extractToken(req);

  if (!token) {
    console.log('No token found in request');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decodedToken = jwt.verify(token, secretKey);
    const userId = decodedToken.userId;

    if (!userId) {
      console.log('No userId found in decoded token:', decodedToken);
      return res.status(400).json({ error: 'Bad request' });
    }

    // Fetch the username from the database based on the userId
    try {
      const username = await fetchUsernameFromDatabase(userId);

      if (username) {
        res.json({ username });
      } else {
        console.log('No username found for userId:', userId);
        res.status(404).json({ error: 'Username not found' });
      }
    } catch (dbError) {
      console.error('Error fetching username from database:', dbError);
      res.status(500).json({ error: 'Database error', details: dbError.message });
    }
  } catch (jwtError) {
    console.error('Error verifying JWT token:', jwtError);
    res.status(500).json({ error: 'JWT error', details: jwtError.message });
  }
});

// Route for user registration
app.post('/register', async (req, res) => {
  const { username, password, email, realname } = req.body;

  // Validate the user data
  if (!username || !password || !email || !realname) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Get the MySQL connection pool
    const pool = await createConnectionPool();

    // Check if the username or email already exists
    const [users] = await pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    if (users.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Add the new user to the database
    const [result] = await pool.query(
      'INSERT INTO users (username, password, email, realname) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, email, realname]
    );

    if (result.affectedRows > 0) {
      // User registered successfully
      res.sendStatus(201); // Send a 201 Created response
    } else {
      // No rows affected
      console.error('Failed to register user:', result);
      res.status(500).json({ error: 'Failed to register user' });
    }
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Route for user login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Validate the user data
  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Get the MySQL connection pool
    const pool = await createConnectionPool();

    // Check if the username exists in the database
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Compare the provided password with the hashed password stored in the database
    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check if the user is an admin
    const isAdmin = user.isAdmin === 1;

    // Generate a JWT token
    const token = jwt.sign({ userId: user.id, isAdmin }, secretKey);

    // Send the token and isAdmin flag as a response
    res.json({ token, isAdmin, username });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '/var/www/html/auburncs-dev')));

// Catch-all route handler
app.get('*', (req, res) => {
  // Respond with the index.html file
  res.sendFile(path.join(__dirname, '/var/www/html/auburncs-dev', 'index.html'));
});

// Create an HTTPS server
const createServer = async () => {
  try {
    const options = await getSSLCertificateOptions();
    const server = https.createServer(options, app);

    // Start the server
    server.listen(port, () => {
      console.log(`Server listening at https://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error creating server:', error);
  }
};

// Call the createServer function
createServer().catch(error => {
  console.error('Failed to start server:', error);
});