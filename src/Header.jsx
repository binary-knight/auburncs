import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Header.css';

const Header = ({ loggedIn, isAdmin, username, setLoggedIn, setUsername, setPassword, setLoginModalIsOpen, setRegisterModalIsOpen, handleCloseLoginModal, handleCloseRegisterModal }) => {
  const [error, setError] = useState('');

  const handleLogout = () => {
    toast.success(`You have successfully logged out.`)
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

  const handleRegisterClick = () => {
    if (!loggedIn) {
      setRegisterModalIsOpen(true);
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
          <li><a href="https://discord.gg/ucX86j7jt6" target="_blank" rel="noopener noreferrer">Join Our Discord!</a></li>
          <li><a href="https://eng.auburn.edu/csse/academics/online/online-undergraduate-program.html" target="_blank" rel="noopener noreferrer">Official AU Site</a></li>
          <li><Link to="/donate">Donate</Link></li>
          <li><a href="#" target="_blank" rel="noopener noreferrer">Software for Students</a></li>
          <li><a href="#" target="_blank" rel="noopener noreferrer">Outside Resources</a></li>
        </ul>
      </div>
      <div className="header-bottom">
        {!loggedIn && (
          <button type="button" onClick={handleLoginClick}>Login</button>
        )}
        {loggedIn && (
          <>
            <p>Welcome, {username}.</p>
            <button type="button" onClick={handleLogout}>Logout</button>
            {isAdmin && <Link to="/user-management">User Management</Link>}
            {isAdmin && <p className="admin-label">Administrator</p>}
          </>
        )}
        {!loggedIn && (
          <button type="button" onClick={handleRegisterClick}>Register</button>
        )}
      </div>
      {loggedIn && (
        <div className="login-popup">
          <div className="login-popup-content">
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
          </div>
        </div>
      )}
    </>
  );
};

export default Header;

