import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/LogIn.css'; // Import CSS file

const LogIn = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        try {
                const response = await fetch('http://localhost:8081/login', {
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
        <div className="zoom-background-login">
            <div className="login-form">
                <form onSubmit={handleSubmit}>
                    <div className="form-group-login">
                        <div className="icon-container-login">
                            <img src="/Images/profile.png" height="20px" alt="Username Icon" className="icon-login" />
                        </div>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="input-login"
                        />
                    </div>
                    <div className="form-group-login">
                        <div className="icon-container-login">
                            <img src="/Images/padlock.png" height="20px" alt="Password Icon" className="icon-login" />
                        </div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-login"
                        />
                    </div>
                    {error && <p className="error">{error}</p>}
                    <button type="submit" className="button-login" style={{ fontWeight: 'bold' }}>Login</button>
                </form>
                <div className="additional-options-login">
                    <span onClick={handleRegistration} >Create Account</span>
                    <span onClick={handleForgotPassword} >Forgot Password?</span>
                </div>
            </div>
        </div>
    );
};

export default LogIn;
