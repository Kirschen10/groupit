import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import './CSS/LogIn.css'; // Import CSS file

const LogIn = () => {
    const navigate = useNavigate();
    const { login } = useUser();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
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
                const songCheckResponse = await fetch(`http://localhost:8081/checkUserSongs?username=${username}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const songCheckData = await songCheckResponse.json();

                if (songCheckResponse.ok) {
                    login({ username }, remember); // Save user data in context
                    if (songCheckData.hasSongs) {
                        navigate('/HomePage'); // Navigate to HomePage
                    } else {
                        navigate('/SelectArtists', { state: { username } }); // Pass the username to SelectArtists
                    }
                } else {
                    setError(songCheckData.message || 'An error occurred. Please try again later.');
                }
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

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="background-login">
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
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-login"
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={togglePasswordVisibility}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    <div className="form-group-login">
                        <label className="remember-me-container">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                            />
                            <span>Remember Me</span>
                        </label>
                    </div>
                    {error && <p className="error">{error}</p>}
                    <button type="submit" className="button-login" style={{ fontWeight: 'bold' }}>Login</button>
                </form>
                <div className="additional-options-login">
                    <span onClick={handleRegistration}>Create Account</span>
                    <span onClick={handleForgotPassword}>Forgot Password?</span>
                </div>
            </div>
        </div>
    );
};

export default LogIn;
