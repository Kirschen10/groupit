// Registration.js
import React from 'react';
import { useState} from 'react';
import { useNavigate  } from 'react-router-dom';
import './CSS/Registration.css'; // Import CSS file

function Registration() {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [birthday , setBirthday] = useState('');
    const [email, setEmail] = useState('');
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
    };

    const handleBackLogIn = (e) => {
        e.preventDefault();
        navigate(`/`);
    };

  return (
    <div style={backgroundStyle}>
        <div className="login-form">
                <form onSubmit={handleSubmit}>
                <div className="form-group">
                        <div className="icon-container">
                            <img src="\Images\user.png" height={"20px"} alt="Name Icon" className="icon" />
                        </div>
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

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
                            <img src="\Images\padlock.png" height={"20px"} alt="Password Icon" className="icon" />
                        </div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <div className="icon-container">
                            <img src="\Images\mail.png" height={"20px"} alt="Email Icon" className="icon" />
                        </div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <div className="icon-container">
                            <img src="\Images\calendar.png" height={"20px"} alt="Age Icon" className="icon" />
                        </div>
                        <input
                            type="date"
                            value={birthday}
                            onChange={(e) => setBirthday(e.target.value)}
                            style={{ textAlign:"left"}}

                        />
                    </div>
                    <button type="submit" onClick={handleSubmit} style={{fontWeight:"bold"}}>Let's tune into your taste!</button>
                </form>
                <div className="additional-options">
                    <span onClick={handleBackLogIn} style={{fontSize:"11px"}}>Back to Login</span>
                </div>
        </div>
    </div>
  )
}

export default Registration
