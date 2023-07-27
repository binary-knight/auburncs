const express = require('express');
const https = require('https');
const fs = require('fs');
const mysql = require('mysql2/promise');
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
const nodemailer = require('nodemailer');
const history = require('connect-history-api-fallback');
const rateLimit = require("express-rate-limit");

// Set the AWS region
process.env.AWS_REGION = 'us-east-1';

require('dotenv').config();

// Use morgan middleware for logging
app.use(morgan('combined')); // 'combined' is a pre-defined log format

// Force HTTP requests to redirect to HTTPS
app.use(sslRedirect.HTTPS({ trustProtoHeader: true }));

app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later."
});

app.use(limiter)

app.use(express.json()); // Parse JSON request bodies

const ssm = new AWS.SSM(); // AWS SSM for grabbing Systems Manager Parameters

const costexplorer = new AWS.CostExplorer({ region: 'us-east-1' }); // Cost explorer for grabbing forecasted costs.

const getForecastedAndCurrentCosts = async () => {
  // Get the current date in UTC and convert it to Pacific Time
  const now = new Date();
  now.setHours(now.getHours() - 7); // Convert from UTC to Pacific Daylight Time
  const end = now.toISOString().split('T')[0];

  // Get the date one day ago
  const oneDayAgo = new Date(now);
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  const start = oneDayAgo.toISOString().split('T')[0];

  // Get the first day of next month for forecast start
  const forecastStart = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split('T')[0];

  // Get the last day of next month for forecast end
  const forecastEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString().split('T')[0];

  // Parameters for the getCostForecast request
  const forecastParams = {
    TimePeriod: { Start: forecastStart, End: forecastEnd },
    Metric: 'UNBLENDED_COST',
    Granularity: 'MONTHLY'
  };

  // Parameters for the getCostAndUsage request
  const usageParams = {
    TimePeriod: { Start: start, End: end },
    Granularity: 'DAILY',
    Metrics: ['UnblendedCost']
  };

  try {
    // Get the forecasted costs
    const forecastResponse = await costexplorer.getCostForecast(forecastParams).promise();

    // Get the current costs
    const usageResponse = await costexplorer.getCostAndUsage(usageParams).promise();
    const currentCosts = usageResponse.ResultsByTime.reduce((total, item) => total + parseFloat(item.Total.UnblendedCost.Amount), 0);

    // Return both the forecasted costs and the current costs
    return {
      forecast: forecastResponse.ForecastResultsByTime,
      current: currentCosts
    };
  } catch (error) {
    console.error('Error retrieving costs:', error);
    throw error;
  }
};

// Retrieve the parameter value from Systems Manager
const getEmailCredentials = async () => {
  const parameterName = '/auburncs/email_credentials';

  const params = {
    Name: parameterName,
    WithDecryption: true
  };

  try {
    const response = await ssm.getParameter(params).promise();
    return JSON.parse(response.Parameter.Value);
  } catch (error) {
    console.error('Error retrieving email credentials:', error);
    throw error;
  }
};

let transporter = null

async function initializeEmailTransporter() {
  try {
    const emailCredentials = await getEmailCredentials();

    transporter = nodemailer.createTransport({
      service: emailCredentials.service,
      auth: {
        user: emailCredentials.user,
        pass: emailCredentials.password
      }
    });

    // Use the transporter for sending emails
    // ...
  } catch (error) {
    console.error('Error initializing email transporter:', error);
    throw error;
  }
}

initializeEmailTransporter();

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
    const excludedPaths = ['/donate', '/login', '/register', '/classes', '/user', '/users', '/classes/:id', '/users/:id', '/verify-email', '/classes/:id/vote'];
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
    if (req.method === 'GET' && req.path.startsWith('/verify-email')) {
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
  const parameterName = `${process.env.REACT_APP_DB_CREDENTIALS}`;

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

let pool;

// Create a MySQL connection pool
const createConnectionPool = async () => {
  try {
    const credentials = await getDatabaseCredentials();

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

// Route for getting the forecasted and current costs
app.get('/donate', async (req, res) => {
  console.log('Attempting to retrieve forecasted and current costs...');

  try {
    // Get the forecasted and current costs
    const costs = await getForecastedAndCurrentCosts();

    // Send the costs in the response
    res.json(costs);
  } catch (error) {
    console.error('Error retrieving costs:', error);
    res.status(500).json({ error: 'An error occurred while retrieving costs' });
  }
});

// Route for getting all classes
app.get('/classes', async (req, res) => {
  console.log('Attempting to retrieve classes...');

  try {
    // Execute the MySQL query to retrieve all classes
    const [rows, fields] = await pool.query('SELECT * FROM classes ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error retrieving classes:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Route for getting a single class
app.get('/classes/:id', async (req, res) => {
  console.log(`Received GET request for class ID ${req.params.id}`);

  const classId = req.params.id;

  try {
    // Perform the necessary logic to get the class from the database
    const [results] = await pool.query('SELECT * FROM classes WHERE id = ?', [classId]);

    if (results.length > 0) {
      // Class found, return it
      console.log(`Class ID ${classId} found successfully`);
      res.status(200).json(results[0]);
    } else {
      // Class not found
      console.log(`No class found with ID ${classId}`);
      res.status(404).json({ error: 'Class not found' });
    }
  } catch (error) {
    console.error('Error getting class:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


// Route for deleting a class
app.delete('/classes/:id', async (req, res) => {
  console.log(`Received DELETE request for class ID ${req.params.id}`);

  const classId = req.params.id;

  try {
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
    // Perform the necessary logic to update the class in the database
    const [result] = await pool.query(
      'UPDATE classes SET name = ?, difficulty = ?, quality = ?, hpw = ?, description = ?, syllabus = ?, elective = ? WHERE id = ?',
      [
        updatedClassData.name,
        updatedClassData.difficulty,
        updatedClassData.quality,
        updatedClassData.hpw,
        updatedClassData.description,
        updatedClassData.syllabus,
        updatedClassData.elective,
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

// Route for fetching votes for a specific class
app.get('/classes/:id/votes', async (req, res) => {
  const classId = req.params.id;

  try {
    const [votes] = await pool.query(
      'SELECT * FROM user_votes WHERE class_id = ?',
      [classId]
    );

    if (votes.length > 0) {
      // Send the votes as the response
      return res.json(votes);
    } else {
      // No votes found for this class
      return res.status(404).json({ error: 'No votes found for this class.' });
    }
  } catch (error) {
    console.error('Error fetching votes:', error);
    return res.status(500).json({ error: 'An error occurred' });
  }
});

// Route for Voting on a Class
app.post('/classes/:id/vote', async (req, res) => {
  const classId = req.params.id;
  let { difficulty, quality, hpw, grade } = req.body;
  const token = extractToken(req);

  // Convert difficulty, quality, and hpw to numbers
  difficulty = parseInt(difficulty);
  quality = parseInt(quality);
  hpw = parseInt(hpw);
  grade = parseInt(grade);

  if (!token) {
    console.log('No token found in request');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decodedToken = jwt.verify(token, secretKey);
    const userId = decodedToken.userId;

    if (!userId) {
      console.log('No userId found in decoded token:', decodedToken);
      return res.status(405).json({ error: 'Bad request' });
    }

    // Check if the user has already voted for this class
    const [voteCheckResult] = await pool.query(
      'SELECT * FROM user_votes WHERE user_id = ? AND class_id = ?',
      [userId, classId]
    );

    //if (voteCheckResult.length > 0) {
      // The user has already voted for this class
    //  return res.status(400).json({ error: 'You have already voted for this class.' });
    //}

    if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5 ||
        !Number.isInteger(quality) || quality < 1 || quality > 5 ||
        !Number.isInteger(hpw) || hpw < 1 || hpw > 4 ||
        !Number.isInteger(grade) || grade < 1 || grade > 7) {
      return res.status(405).json({ error: 'Invalid voting parameters' });
    }

    try {
      const [result] = await pool.query('SELECT difficulty, quality, hpw, votes FROM classes WHERE id = ?', [classId]);

      if (result.length > 0) {
        const currentDifficulty = result[0].difficulty;
        const currentQuality = result[0].quality;
        const currentHPW = result[0].hpw;
        const currentVotes = result[0].votes;

        const newDifficulty = Math.round((currentDifficulty * currentVotes + difficulty) / (currentVotes + 1));
        const newQuality = Math.round((currentQuality * currentVotes + quality) / (currentVotes + 1));
        const newHPW = Math.round((currentHPW * currentVotes + hpw) / (currentVotes + 1));
        const newVotes = currentVotes + 1;

        const [updateResult] = await pool.query(
          'UPDATE classes SET difficulty = ?, quality = ?, hpw = ?, votes = ? WHERE id = ?',
          [newDifficulty, newQuality, newHPW, newVotes, classId]
        );

        if (updateResult.affectedRows > 0) {
          if (userId) {
            await pool.query('INSERT INTO user_votes(user_id, class_id, difficulty, quality, hpw, grade) VALUES (?, ?, ?, ?, ?, ?)', 
            [userId, classId, difficulty, quality, hpw, grade]);
          }

          const [updatedClassResult] = await pool.query('SELECT * FROM classes WHERE id = ?', [classId]);

          if (updatedClassResult.length > 0) {
            const updatedClass = updatedClassResult[0];
            return res.json(updatedClass);
          } else {
            return res.status(404).json({ error: 'Class not found' });
          }
        } else {
          return res.status(404).json({ error: 'Class not found' });
        }
      } else {
        return res.status(404).json({ error: 'Class not found' });
      }
    } catch (error) {
      console.error('Error voting on class:', error);
      return res.status(500).json({ error: 'An error occurred' });
    }
  } catch (jwtError) {
    console.error('Error verifying JWT token:', jwtError);
    return res.status(500).json({ error: 'JWT error', details: jwtError.message });
  }
});

app.put('/classes/:id/clear-stats', async (req, res) => {
  const classId = req.params.id;

  try {
    // Perform the necessary logic to clear the stats of the class in the database
    const [result] = await pool.query(
      'UPDATE classes SET difficulty = 0, quality = 0, hpw = 0, votes = 0 WHERE id = ?',
      [classId]
    );

    if (result.affectedRows > 0) {
      // Delete the corresponding votes from the user_votes table
      await pool.query(
        'DELETE FROM user_votes WHERE class_id = ?',
        [classId]
      );

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

app.delete('/users/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    // Delete user votes first
    await pool.query('DELETE FROM user_votes WHERE user_id = ?', [userId]);

    // Then delete the user
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

  // Check if the email is an auburn.edu email
  if (!email.endsWith('@auburn.edu')) {
    return res.status(400).json({ error: 'Only auburn.edu emails are allowed' });
  }

  try {
    // Check if the username or email already exists
    const [users] = await pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    if (users.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Generate a unique verification token for the user
    const token = crypto.randomBytes(20).toString('hex');

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Add the new user to the database with the verification token
    const [result] = await pool.query(
      'INSERT INTO users (username, password, email, realname, token, verified) VALUES (?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, email, realname, token, false]
    );

    // send verification email
    const verificationLink = `${process.env.REACT_APP_API_ROUTE}/verify-email?token=${token}`;
    const mailOptions = {
      from: 'auburnonlinecs@gmail.com',
      to: email,
      subject: 'Please verify your email address',
      text: `Click the following link to verify your email address: ${verificationLink}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending verification email:', error);
        return res.status(500).json({ error: 'An error occurred during registration' });
      } else {
        console.log(`Email sent: ${info.response}`);
        // Send a 200 status code and a success message
        return res.status(200).json({ message: 'Registration successful' });
      }
    });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'An error occurred during registration' });
  }
});


// Route for email verification
app.get('/verify-email', async (req, res) => {
  // Get the token from the URL parameters
  const token = req.query.token;

  try {
    // Look up the user with the given token
    const [users] = await pool.query('SELECT * FROM users WHERE token = ?', [token]);
    if (users.length === 0) {
      return res.status(400).send(`
            <html>
                <head>
                    <title>Email Verification Error</title>
                </head>
                <body>
                    <h1>Error verifying email</h1>
                    <p>Invalid token. Please try again.</p>
                </body>
            </html>
        `);
    }

    // Mark the user's email as verified
    await pool.query('UPDATE users SET verified = true WHERE token = ?', [token]);

    // Send a success HTML page
    res.send(`
        <html>
            <head>
                <title>Email Verification</title>
            </head>
            <body>
                <h1>Email verified</h1>
                <p>You may now log in.</p>
            </body>
        </html>
    `);

  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).send(`
        <html>
            <head>
                <title>Email Verification Error</title>
            </head>
            <body>
                <h1>Error verifying email</h1>
                <p>An error occurred. Please try again later or contact JKnight on discord.</p>
            </body>
        </html>
    `);
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

    // Check if the user's email is verified
    if (!user.verified) {
      return res.status(401).json({ error: 'Email not verified. Please check your email for verification link.' });
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

app.use(history());
app.use(express.static(path.join(__dirname, '/var/www/html/auburncs-dev')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/var/www/html/auburncs-dev', 'index.html'));
});

// Create an HTTPS server and start your server
const startServer = async () => {
  try {
    // Create the connection pool
    await createConnectionPool();

    const options = await getSSLCertificateOptions();
    const server = https.createServer(options, app);

    // Start the server
    server.listen(port, () => {
      console.log(`Server listening at https://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

// Call the startServer function
startServer().catch(error => {
  console.error('Failed to start server:', error);
});
