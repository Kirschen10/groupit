import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/CheckMail.css';

const CheckMail = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(10);

    const backgroundStyle = {
        backgroundImage: `url('/Images/BackgroundWithlogo.svg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        width: '100%',  // Ensure it covers full width
    };

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (countdown === 0) {
            navigate('/');
        }
        return () => clearTimeout(timer);
    }, [countdown, navigate]);

    return (
        <div style={backgroundStyle}>
                <div className="check-mail-box">
                    <img src="/Images/mail.png" alt="Mail Icon" className="mail-icon" />
                    <h2>Reset Password Email Sent</h2>
                    <p>We have sent a reset password link to your email address.</p>
                    <p>Please check your mailbox and follow the instructions to reset your password.</p>
                    <p className="success-message">
                    Redirecting in {countdown} seconds...
                </p>
                </div>
        </div>
    );
};

export default CheckMail;
