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


    const handleSubmit = (e) => {
        e.preventDefault();
        fetch('http://localhost:8081/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ firstName, lastName, birthday, email, username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Registration successful') {
                navigate('/SelectArtists', { state: { username } }); // Pass the username to SelectArtists
            } else {  
                console.error('Registration failed:', data.message);
                setError(data.message);  // Set the error message
            }
        })
        .catch(error => {
            setError('Failed to connect to server');  // Set a generic error message
            console.error('Error during registration:', error);
        });
    };

    const handleBackLogIn = (e) => {
        e.preventDefault();
        navigate(`/`);
    };

    return (
        <div className="background-Registration">
            <div className="registration-form">
                <form onSubmit={handleSubmit}>
                    <div className="form-group-reg">
                        <div className="icon-container-reg">
                            <img src="/Images/user.png" height="20px" alt="Name Icon" />
                        </div>
                        <input
                            className="input-reg"
                            type="text"
                            placeholder="First name"
                            value={firstName}
                            required
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>
                    <div className="form-group-reg">
                        <div className="icon-container-reg">
                            <img src="/Images/user.png" height={"20px"} alt="Name Icon" />
                        </div>
                        <input
                            className="input-reg"
                            type="text"
                            placeholder="Last name"
                            value={lastName}
                            required
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                    <div className="form-group-reg">
                        <div className="icon-container-reg">
                            <img src="/Images/profile.png" height={"20px"} alt="Username Icon" />
                        </div>
                        <input
                            className="input-reg"
                            type="text"
                            placeholder="Username"
                            value={username}
                            required
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="form-group-reg">
                        <div className="icon-container-reg">
                            <img src="/Images/padlock.png" height={"20px"} alt="Password Icon" />
                        </div>
                        <input
                            className="input-reg"
                            type="password"
                            placeholder="Password"
                            value={password}
                            required
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="form-group-reg">
                        <div className="icon-container-reg">
                            <img src="/Images/mail.png" height={"20px"} alt="Email Icon" />
                        </div>
                        <input
                            className="input-reg"
                            type="email"
                            placeholder="Email"
                            value={email}
                            required
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group-reg">
                        <div className="icon-container-reg">
                            <img src="/Images/calendar.png" height={"20px"} alt="Birthday Icon" />
                        </div>
                        <input
                            type="date"
                            value={birthday}
                            onChange={(e) => setBirthday(e.target.value)}
                            required
                            style={{ textAlign: "left" }}
                            className="input-reg"
                        />
                    </div>
                    {error && <p className="error">{error}</p>}
                    <button className={"button-reg"} type="submit" style={{ fontWeight: "bold" }}>Let's tune into your taste!</button>
                </form>
                <div className="additional-options-reg">
                    <span onClick={handleBackLogIn}>Back to Login</span>
                </div>
            </div>
        </div>
    );
}

export default Registration;
