import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import Banner from './Banner';
import Header from './Header';
import ClassList from './ClassList';
import Register from './Register';
import LoginPage from './LoginPage';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setAdmin] = useState(false);
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isAdminUser = localStorage.getItem('isAdmin') === 'true';
    if (token) {
      setLoggedIn(true);
      setAdmin(isAdminUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Fetch the username from the server
      axios
        .get('https://dev.auburnonlinecs.com:3000/user')
        .then(response => {
          setUsername(response.data.username);
        })
        .catch(error => {
          console.log('Error fetching username:', error);
        });
    }
  }, []);

  const handleCloseLoginModal = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    delete axios.defaults.headers.common['Authorization'];
    setLoggedIn(false);
    setAdmin(false);
    setLoginModalIsOpen(false);
  };

  return (
    <Router>
      <div className="App">
        <Banner />
        <Header
          loggedIn={loggedIn}
          isAdmin={isAdmin}
          username={username}
          setLoginModalIsOpen={setLoginModalIsOpen}
          handleCloseLoginModal={handleCloseLoginModal}
        />
        <Routes>
          <Route path="/" element={<ClassList loggedIn={loggedIn} isAdmin={isAdmin} />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
      {loginModalIsOpen && (
        <LoginPage setIsOpen={setLoginModalIsOpen} setLoggedIn={setLoggedIn} setAdmin={setAdmin} />
      )}
    </Router>
  );
}

export default App;

