import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/LogIn.css';

const LogIn = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const backgroundStyle = {
        backgroundImage: `url('/Images/BackgroundWithlogo.svg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:8081/users_data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                navigate('/HomePage');
            } else {
                setError(data.message || 'An error occurred. Please try again later.');
            }
        } catch (err) {
            setError('An error occurred. Please try again later. Details: ' + err.message);
            console.error('Fetch error:', err);
        }
    };

    const handleRegistration = (e) => {
        e.preventDefault();
        navigate('/Registration');
    };

    const handleForgotPassword = (e) => {
        e.preventDefault();
        navigate('/ForgotPassword');
    };

    return (
        <div style={backgroundStyle}>
            <div className="login-form">
                <form onSubmit={handleSubmit}>
                    <div className="form-group-LogIn">
                        <div className="icon-container-LogIn">
                            <img src="\Images\profile.png" height={"20px"} alt="Username Icon" className="icon" />
                        </div>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="form-group-LogIn">
                        <div className="icon-container-LogIn">
                            <img src="\Images\padlock.png" height={"20px"} alt="Password Icon" className="icon" />
                        </div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error && <p className="error">{error}</p>}
                    <button type="submit">Login</button>
                </form>
                <div className="additional-options">
                    <span onClick={handleRegistration}>Create Account</span>
                    <span onClick={handleForgotPassword}>Forgot password?</span>
                </div>
            </div>
        </div>
    );
};

export default LogIn;
