import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/Registration.css'; // Import CSS file

function Registration() {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthday, setBirthday] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');  // State variable for error message

    const backgroundStyle = {
        backgroundImage: `url('/Images/BackgroundWithlogo.svg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh', // Set minimum height to cover the entire viewport
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:8081/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ firstName, lastName, birthday, email, username, password }),
                credentials: 'include' // Include credentials in the request
            });

            const data = await response.json();

            if (response.ok) {
                navigate('/SelectArtists'); // Redirect to the desired page after successful registration
            } else {
                setError(data.message || 'An error occurred. Please try again later.');
            }
        } catch (error) {
            setError('Failed to connect to server');  // Set a generic error message
            console.error('Error during registration:', error);
        }
    };

    const handleBackLogIn = (e) => {
        e.preventDefault();
        navigate(`/`);
    };

    return (
        <div style={backgroundStyle}>
            <div className="login-form-Registration">
                <form onSubmit={handleSubmit}>
                    <div className="form-group-Registration">
                        <div className="icon-container-Registration">
                            <img src="/Images/user.png" height={"20px"} alt="Name Icon" className="icon" />
                        </div>
                        <input
                            type="text"
                            placeholder="First name"
                            value={firstName}
                            required
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>
                    <div className="form-group-Registration">
                        <div className="icon-container-Registration">
                            <img src="/Images/user.png" height={"20px"} alt="Name Icon" className="icon" />
                        </div>
                        <input
                            type="text"
                            placeholder="Last name"
                            value={lastName}
                            required
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                    <div className="form-group-Registration">
                        <div className="icon-container-Registration">
                            <img src="/Images/profile.png" height={"20px"} alt="Username Icon" className="icon" />
                        </div>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            required
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="form-group-Registration">
                        <div className="icon-container-Registration">
                            <img src="/Images/padlock.png" height={"20px"} alt="Password Icon" className="icon" />
                        </div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            required
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="form-group-Registration">
                        <div className="icon-container-Registration">
                            <img src="/Images/mail.png" height={"20px"} alt="Email Icon" className="icon" />
                        </div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            required
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group-Registration">
                        <div className="icon-container-Registration">
                            <img src="/Images/calendar.png" height={"20px"} alt="Birthday Icon" className="icon" />
                        </div>
                        <input
                            type="date"
                            value={birthday}
                            onChange={(e) => setBirthday(e.target.value)}
                            required
                            style={{ textAlign: "left" }}
                        />
                    </div>
                    {error && <p className="error">{error}</p>}
                    <button type="submit" style={{ fontWeight: "bold" }}>Let's tune into your taste!</button>
                </form>
                <div className="additional-options-Registration">
                    <span onClick={handleBackLogIn} style={{ fontSize: "11px" }}>Back to Login</span>
                </div>
            </div>
        </div>
    );
}

export default Registration;
