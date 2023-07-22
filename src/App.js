import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import Banner from './Banner';
import Header from './Header';
import ClassList from './ClassList';
import Register from './Register';
import LoginPage from './LoginPage';
import UserManagement from './UserManagement';
import Donate from './Donate';
import FAQ from './faq';
import Resources from './resources';
import HomePage from './HomePage';
import Grade from './Grade';
import BreakdownModal from './BreakdownModal';
import './App.css'

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
        .get(`${process.env.REACT_APP_API_ROUTE}/user`)
        .then(response => {
          setUsername(response.data.username);
          setUserId(response.data.id); // Set the userId state
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
        <Route path="/" element={<HomePage />} />
          <Route path="/classlist" element={<ClassList loggedIn={loggedIn} isAdmin={isAdmin} token={localStorage.getItem('token')} userId={userId} />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/grade" element={<Grade />} />
          <Route path="/breakdown/:classId" element={<BreakdownModal token={localStorage.getItem('token')} />} />
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



