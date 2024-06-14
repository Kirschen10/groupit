import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/Profile.css'; // Import CSS file

function Profile() {
    const navigate = useNavigate();

    const handleHomePage = () => {
        navigate(`/HomePage`);
    };

    const handleEdit = () => {
        // Handle edit details action
        console.log('Edit details clicked');
    };

    const handleSignOut = () => {
        // Handle sign out action
        console.log('Sign out clicked');
    };

     return (
        <div className="zoom-background-profile">
            <span className="Home-page-button" onClick={handleHomePage}>
                <img src="/Images/Logo.svg" alt="Logo" />
            </span>
            <div className="info-container">
                <h2>Personal Information</h2>
                {/*<img className="profile-image" src="/Images/user.svg" alt="Profile" />*/}
                <div className="info-content">
                    <div>
                        <p>
                            <span className="label">First Name</span>
                            John
                        </p>
                    </div>
                    <div>
                        <p>
                            <span className="label">Last Name</span>
                            Doe
                        </p>
                    </div>
                    <div>
                        <p>
                            <span className="label">User Name</span>
                            johndoe
                        </p>
                    </div>
                    <div>
                        <p>
                            <span className="label">Email</span>
                            john.doe@example.com
                        </p>
                    </div>
                    <div>
                        <p>
                            <span className="label">Birthday</span>
                            01/01/2001
                        </p>
                    </div>
                    <div>
                        <p>
                            <span className="label">Password</span>
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
