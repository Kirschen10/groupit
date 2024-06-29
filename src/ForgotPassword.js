// ForgotPassword.js
import React from 'react';
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import './CSS/ForgotPassword.css'; // Import CSS file

function ForgotPassword() {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');


    const handleHomePage = (e) => {
        e.preventDefault();
        navigate(`/`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:8081/password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username, email}),
            });

            const data = await response.json();

            if (response.ok) {
                navigate('/checkMail');
            } else {
                setError(data.message || 'An error occurred. Please try again later.');
            }
        } catch (err) {
            setError('An error occurred. Please try again later. Details: ' + err.message);
            console.error('Fetch error:', err);
        }
    };

    return (
        <div className="background-ForgotPassword">
            <span className="Home-page-button-ForgotPassword" onClick={handleHomePage}>
                <img src="/Images/Logo.svg" alt="Logo" />
            </span>
            <div className="ForgotPassword-form">
                <img src="\Images\lock.png" height={"80px"} alt="Lock Icon" className="iconLock"/>
                <h2 className='h2-ForgotPassword'>Email Verification</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group-ForgotPassword">
                        <div className="icon-container-ForgotPassword">
                            <img src="\Images\profile.png" height={"20px"} alt="Username Icon" className="icon"/>
                        </div>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            required
                            onChange={(e) => setUsername(e.target.value)}
                            className="input-ForgotPassword"
                        />
                    </div>
                    <div className="form-group-ForgotPassword">
                        <div className="icon-container-ForgotPassword">
                            <img src="\Images\mail.png" height={"20px"} alt="Mail Icon" className="icon"/>
                        </div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            requierd
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-ForgotPassword"
                        />
                    </div>
                    {error && <p className="error">{error}</p>}
                    <button type="submit" className="button-ForgotPassword" style={{ fontWeight: 'bold' }}>Reset Password</button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword
