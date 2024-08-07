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
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');  // State variable for error message

    const handleSubmit = (e) => {
        e.preventDefault();

        const minDate = new Date('1900-01-01');
        const maxDate = new Date();
        const enteredDate = new Date(birthday);
        const enteredEmail = new String(email);

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (enteredDate < minDate) {
            setError('Birthday must be after January 1st, 1900')
            return;
        } else if (enteredDate > maxDate) {
            setError('Birthday cannot be in the future');
            return;
        }
        if (!enteredEmail.match(
                    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
                    ){
            setError('email is not valid');
            return;
        }

        if (!password.match(passwordRegex)) {
            setError('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
            return;
        }

        fetch('http://localhost:8081/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ firstName, lastName, birthday, email, username, password })
        })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(({ status, body }) => {
            if (status === 201) {
                navigate('/SelectArtists', { state: { username } }); // Pass the username to SelectArtists
            } else {
                console.error('Registration failed:', body.message);
                if (body.message === 'Username already exists') {
                    setError('Username is already taken');
                } else if (body.message === 'Email already registered') {
                    setError('Email has already been registered');
                } else {
                    setError('Registration failed');
                }
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

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="background-Registration">

            <div>
                <span className="back-to-login-button" onClick={handleBackLogIn}>
                    <img src="/Images/Back.png" alt="Back to Login" />
                </span>
            </div>
            <div className="registration-form">
                <div className="Create-new-account">
                    <h2>Create new account</h2>
                </div>
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
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            required
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="toggle-password-reg"
                            onClick={togglePasswordVisibility}
                        >
                            <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                        </button>
                    </div>
                    <div className="form-group-reg">
                        <div className="icon-container-reg">
                            <img src="/Images/mail.png" height={"20px"} alt="Email Icon" />
                        </div>
                        <input
                            className="input-reg"
                            type="text"
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
            </div>
        </div>
    );
}

export default Registration;
