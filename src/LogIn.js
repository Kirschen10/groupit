// LogIn.js
import React from 'react';

import { useState} from 'react';
import { useNavigate  } from 'react-router-dom';
import './CSS/LogIn.css'; // Import CSS file

const LogIn = () => {
    const navigate = useNavigate();

    const connectionString = connectServer.env.REACT_APP_GROUPIT_DB_CONNECTION_STRING;



    conn = get_db_connection()

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const backgroundStyle = {
        backgroundImage: `url('/Images/BackgroundWithlogo.svg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh', // Set minimum height to cover the entire viewport
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate(`/HomePage`);
    };

    const handleRegistration = (e) => {
        e.preventDefault();
        navigate(`/Registration`);
    };

    const handleForgotPassword = (e) => {
        e.preventDefault();
        navigate(`/ForgotPassword`);
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
                            <img src="\Images\padlock.png" height={"20px"} alt="Username Icon" className="icon" />
                        </div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" onClick={handleSubmit}>Login</button>
                </form>
                <div className="additional-options">
                    <span onClick={handleRegistration}>Create Account</span>
                    <span onClick={handleForgotPassword}>Forgot password ?</span>
                </div>
            </div>
    </div>
  );
};

export default LogIn;
