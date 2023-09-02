/**
 * This file contains all of the server-side logic dealing with users
 */

const bcrypt = require('bcrypt');
const { fetchJWTSecret } = require('../config/aws');

// Login logic
const handleLogin = async (req, res) => {
  const { username, password } = req.body;

  // Validate the user data
  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const [users] = req.dbConn.query('SELECT username, password, isAdmin FROM users WHERE username = ?', [username]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Compare the provided password with the hashed password stored in the database
    const user = users[0];

    // TODO: add salting functionality

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // TODO: reimplement email verification

    // Generate a JWT token
    const secretKey = await fetchJWTSecret();
    const token = jwt.sign({ userId: user.id, isAdmin }, secretKey);

    // Send the token and isAdmin flag as a response
    res.json({ token, username });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
};

// Signup logic
const handleSignup = async (req, res) => {
  const { username, password, email, realname } = req.body;

  // Validate the user data
  if (!username || !password || !email || !realname) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // TODO: check if this is secure enough, is there a better way to check email?
  // Check if the email is an auburn.edu email
  if (!email.endsWith('@auburn.edu')) {
    return res.status(400).json({ error: 'Only auburn.edu emails are allowed' });
  }

  try {
    // Check if the username or email already exists
    const [users] = await req.dbConn.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    if (users.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash the password
    // TODO: implement salting capabilities
    const hashedPassword = await bcrypt.hash(password, 10);

    // Add the new user to the database with the verification token
    const [result] = await req.dbConn.query(
      'INSERT INTO users (username, password, email, realname, verified) VALUES (?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, email, realname, false]
    );

    // TODO: re-implement email verification (include custom email token in stmt above)

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'An error occurred during registration' });
  }
};

module.exports = {
  handleLogin,
  handleSignup,
};