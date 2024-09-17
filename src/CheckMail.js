import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/CheckMail.css';

const CheckMail = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(10);

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
        <div className='background-Registration'>
            <div className="check-mail-box">
                <div className="sub-check-mail-box">
                    <div className="check-mail-box-content">
                        <img src="/Images/mail.png" alt="Mail Icon" className="mail-icon" />
                        <h2>Reset Password Email Sent</h2>
                        <p>We have sent a reset password link to your email address.</p>
                        <p>Please check your mailbox and follow the instructions<br/>to reset your password.</p>
                        <div className="success-message">
                        Redirecting in {countdown} seconds...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckMail;
