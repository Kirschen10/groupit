import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import './CSS/Questions.css';

function Questions() {
    const navigate = useNavigate();
    const { user, logout } = useUser();


    const handleHomePage = () => {
        navigate(`/HomePage`);
    };

    const handleProfile = () => {
        navigate(`/Profile`);
    };


    return (
        <div className="background-profile">
            <div>
                <span className="profile-button" onClick={handleProfile}>
                    <img src="/Images/user.svg" alt="Profile" />
                </span>
            </div>
            <span className="Home-page-button" onClick={handleHomePage}>
                <img src="/Images/Logo.svg" alt="Logo" />
            </span>
            <h2>About Us</h2>
        </div>
    );
}

export default Questions;