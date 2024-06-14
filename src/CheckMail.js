import React from 'react';
import './CSS/CheckMail.css';

const CheckMail = () => {
    const backgroundStyle = {
        backgroundImage: `url('/Images/BackgroundWithlogo.svg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        width: '100%',  // Ensure it covers full width
    };

    return (
        <div style={backgroundStyle}>
                <div className="check-mail-box">
                    <img src="/Images/mail.png" alt="Mail Icon" className="mail-icon" />
                    <h2>Reset Password Email Sent</h2>
                    <p>We have sent a reset password link to your email address.</p>
                    <p>Please check your mailbox and follow the instructions to reset your password.</p>
                </div>
        </div>
    );
};

export default CheckMail;
