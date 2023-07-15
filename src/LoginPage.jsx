import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LoginPage = ({ setIsOpen, setLoggedIn, setAdmin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // When the component mounts, check if a token exists in local storage
  // and set it as a default header in axios
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Send a request to the server to validate the user's credentials
      const response = await axios.post(`${process.env.REACT_APP_API_ROUTE}/login`, { username, password });
      const { token, isAdmin } = response.data;

      // Set user status as logged in
      setLoggedIn(true);
      // Set user status as admin
      setAdmin(isAdmin);
      // Save the token and admin status in local storage
      localStorage.setItem('token', token);
      localStorage.setItem('isAdmin', isAdmin);
      // Set the token as a default header in axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Close the login page
      setIsOpen(false);
    } catch (error) {
      // Clear the input fields
      setUsername('');
      setPassword('');
      // Display error message
      if (error.response && error.response.status === 401) {
        // If the server returns a 401 status code (Unauthorized),
        // remove the token from local storage and headers
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        delete axios.defaults.headers.common['Authorization'];
      }
      setErrorMessage('Username not found or password incorrect');
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={() => setIsOpen(false)}>&times;</span>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
        {errorMessage && <p>{errorMessage}</p>}
      </div>
    </div>
  );
};

export default LoginPage;
