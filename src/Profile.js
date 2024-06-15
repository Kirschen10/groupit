import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import './CSS/Profile.css'; // Import CSS file

function Profile() {
    const navigate = useNavigate();
    const { user, logout } = useUser();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`http://localhost:8081/api/user-data/${user.username}`);
                const data = await response.json();

                if (response.ok) {
                    setUserData(data);
                } else {
                    console.error('Error fetching user data:', data.message);
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
            }
        };

        if (user) {
            fetchUserData();
        }
    }, [user]);

    const handleHomePage = () => {
        navigate(`/HomePage`);
    };

    const handleEdit = () => {
        // Handle edit details action
        console.log('Edit details clicked');
    };

    const handleSignOut = () => {
        logout();
        navigate('/');
    };


    return (
        <div className="zoom-background-profile">
            <span className="Home-page-button" onClick={handleHomePage}>
                <img src="/Images/Logo.svg" alt="Logo" />
            </span>
            <div className="info-container">
                <h2>Personal Information</h2>
                <div className="info-content">
                    <div>
                        <p>
                            <span className="label">First Name: </span>
                            {userData?.firstName || 'Loading...'}
                        </p>
                    </div>
                    <div>
                        <p>
                            <span className="label">Last Name: </span>
                            {userData?.lastName || 'Loading...'}
                        </p>
                    </div>
                    <div>
                        <p>
                            <span className="label">User Name: </span>
                            {userData?.userName || 'Loading...'}
                        </p>
                    </div>
                    <div>
                        <p>
                            <span className="label">Email: </span>
                            {userData?.email || 'Loading...'}
                        </p>
                    </div>
                    <div>
                        <p>
                            <span className="label">Birthday: </span>
                            {userData?.birthday || 'Loading...'}
                        </p>
                    </div>
                    <div>
                        <p>
                            <span className="label">Password: </span>
                            ********
                        </p>
                    </div>
                </div>
                <div className="buttons">
                    <button onClick={handleEdit}>
                        <img src="/Images/edit icon.svg" alt="Edit" /> Edit
                    </button>
                    <button onClick={handleSignOut}>
                        <img src="/Images/sign out icon.svg" alt="Sign Out" /> Sign Out
                    </button>
                </div>
            </div>
            <div className="content-container">
                <div className="content-box">
                    <h2>My Favorite Music</h2>
                    {/* Content for favorite music */}
                </div>
                <div className="content-box">
                    <h2>My Group</h2>
                    {/* Content for group */}
                </div>
            </div>
        </div>
    );
}

export default Profile;
