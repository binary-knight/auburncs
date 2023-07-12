import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import Banner from './Banner';
import Header from './Header';
import ClassList from './ClassList';
import Register from './Register';
import LoginPage from './LoginPage';
import UserManagement from './UserManagement';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setAdmin] = useState(false);
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  const [registerModalIsOpen, setRegisterModalIsOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isAdminUser = localStorage.getItem('isAdmin') === 'true';
    if (token) {
      setLoggedIn(true);
      setAdmin(isAdminUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
      // Fetch the username and userId from the server
      axios
        .get('https://dev.auburnonlinecs.com:3000/user')
        .then(response => {
          console.log(response.data);
          setUsername(response.data.username);
          setUserId(response.data.id); // Set the userId state
          console.log(`userId: ${response.data.id}`);
        })
        .catch(error => {
          console.log('Error fetching username and userId:', error);
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

  const handleCloseRegisterModal = () => {
    setRegisterModalIsOpen(false);
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
          setRegisterModalIsOpen={setRegisterModalIsOpen}
          handleCloseLoginModal={handleCloseLoginModal}
          handleCloseRegisterModal={handleCloseRegisterModal} // Pass down this function to the Header component
        />
        <Routes>
          <Route path="/" element={<ClassList loggedIn={loggedIn} isAdmin={isAdmin} token={localStorage.getItem('token')} userId={userId} />} /> // Pass the userId prop
          <Route path="/user-management" element={<UserManagement />} />
        </Routes>
      </div>
      {loginModalIsOpen && (
        <LoginPage setIsOpen={setLoginModalIsOpen} setLoggedIn={setLoggedIn} setAdmin={setAdmin} />
      )}
      {registerModalIsOpen && (
        <Register modalIsOpen={registerModalIsOpen} setModalIsOpen={setRegisterModalIsOpen} />
      )}
    </Router>
  );
}

export default App;



