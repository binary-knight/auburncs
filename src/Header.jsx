import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Header.css';

const Header = ({ loggedIn, isAdmin, username, setLoggedIn, setUsername, setPassword, setLoginModalIsOpen, handleCloseLoginModal }) => {
  const [error, setError] = useState('');

  const handleLogout = () => {
    handleCloseLoginModal();
    setUsername('');
    setPassword('');
    setLoggedIn(false);
  };

  const handleLoginClick = () => {
    if (!loggedIn) {
      setLoginModalIsOpen(true);
    }
  };

  const handleLogin = () => {
    // Implement the login logic here
  };

  return (
    <>
      <div className="header-top">
        <ul>
          <li><a href="https://www.reddit.com/r/AuburnOnlineCS/" target="_blank" rel="noopener noreferrer">Reddit</a></li>
          <li><a href="#" target="_blank" rel="noopener noreferrer">Resource 2</a></li>
          <li><a href="#" target="_blank" rel="noopener noreferrer">Resource 3</a></li>
          <li><a href="#" target="_blank" rel="noopener noreferrer">Resource 4</a></li>
          <li><a href="#" target="_blank" rel="noopener noreferrer">Resource 5</a></li>
        </ul>
      </div>
      <div className="header-bottom">
        {!loggedIn && (
          <button type="button" onClick={handleLoginClick}>Login</button>
        )}
        {loggedIn && (
          <>
            <p>Welcome, {username}!</p>
            <button type="button" onClick={handleLogout}>Logout</button>
          </>
        )}
        {!loggedIn && (
          <Link to="/register">Register</Link>
        )}
      </div>
      {loggedIn && (
        <div className="login-popup">
          <div className="login-popup-content">
            <h2>Login</h2>
            {error && <p className="error-message">{error}</p>}
            {!loggedIn && (
              <form onSubmit={handleLogin}>
                <label>Username:</label>
                <input type="text" onChange={(e) => setUsername(e.target.value)} />
                <label>Password:</label>
                <input type="password" onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Login</button>
              </form>
            )}
            {loggedIn && (
              <p>Login successful!</p>
            )}
            <button type="button" onClick={handleCloseLoginModal}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;




