import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Header.css';

const Header = ({ loggedIn, isAdmin, username, setLoggedIn, setUsername, setPassword, setLoginModalIsOpen, setRegisterModalIsOpen, handleCloseLoginModal, handleCloseRegisterModal }) => {

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

  return (
    <>
      <div className="header-top">
        <ul>
          <li><a href="https://www.reddit.com/r/AuburnOnlineCS/" target="_blank" rel="noopener noreferrer">Reddit</a></li>
          <li><a href="https://discord.gg/ucX86j7jt6" target="_blank" rel="noopener noreferrer">Join Our Discord!</a></li>
          <li><a href="https://eng.auburn.edu/csse/academics/online/online-undergraduate-program.html" target="_blank" rel="noopener noreferrer">Official AU Site</a></li>
          <li><Link to="/classlist">Class Reviews & Info</Link></li>
          <li><Link to="/donate">Donate</Link></li>
          <li><Link to="/faq">FAQ</Link></li>
          <li><Link to="/resources">Resources</Link></li>
        </ul>
      </div>
      <div className="header-bottom">
        {!loggedIn ? (
          <>
            <button type="button" onClick={handleLoginClick}>Login</button>
            <button type="button" onClick={handleRegisterClick}>Register</button>
          </>
        ) : (
          <>
            <div className="welcome-section">
              <p>Welcome, {username}.</p>
              {isAdmin && <Link to="/user-management" className="user-management-button">User Management</Link>}
            </div>
            <div className="logout-section">
              <button type="button" onClick={handleLogout} className="logout-button">Logout</button>
            </div>
          </>
        )}
      </div>
      {isAdmin && <p className="admin-label">Administrator</p>}
    </>
  );
  
};

export default Header;

