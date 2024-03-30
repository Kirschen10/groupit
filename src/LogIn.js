// LogIn.js
import React from 'react';
import { useState} from 'react';
import { useNavigate  } from 'react-router-dom';
import './CSS/LogIn.css'; // Import CSS file

const LogIn = () => {
    const navigate = useNavigate();

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
        navigate(`/HelloWorld`);
    };


  return (
    <div style={backgroundStyle}>
     <div className="login-form">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <div className="icon-container">
                            <img src="\Images\profile.png" height={"20px"} alt="Username Icon" className="icon" />
                        </div>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                    <div className="icon-container">
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
                <span>Create Account</span>
                <span>Need Help ?</span>
            </div>
            </div>
    </div>
  );
};

export default LogIn;
