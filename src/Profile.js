import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/Profile.css'; // Import CSS file

function Profile() {
    const navigate = useNavigate();

    const handleHomePage = () => {
        navigate(`/HomePage`);
    };

    return (
        <div className="zoom-background-profile">
            <div>
                <span className="Home-page-button" onClick={handleHomePage}>
                    <img src="/Images/logo.svg" alt="Logo" />
                </span>
            </div>
        </div>
    );
}

export default Profile;
