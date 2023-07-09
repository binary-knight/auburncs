import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [realname, setRealname] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate the form data
        if (!username || !password || !realname || !email) {
            setError('All fields are required');
            return;
        }

        if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
            setError('Password must be at least 8 characters long and contain a mixture of letters and numbers');
            return;
        }

        try {
            // Send a POST request to the server
            await axios.post('https://dev.auburnonlinecs.com:3000/register', { username, password, realname, email });

            // If the request is successful, clear the form and the error message
            setUsername('');
            setPassword('');
            setRealname('');
            setEmail('');
            setError('');

            // Display success message to the user
            alert('Registration successful!');

            // Redirect the user to the root page
            navigate('/');
            
        } catch (error) {
            // If the request fails, set the error message
            if (error.response && error.response.data && error.response.data.error) {
                setError(error.response.data.error);
            } else {
                setError('An error occurred');
            }
        }
    };

    return (
        <div style={{ backgroundColor: '#dd550c', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px' }}>
                <h2>Register</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <input type="text" placeholder="Real Name" value={realname} onChange={(e) => setRealname(e.target.value)} required />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;