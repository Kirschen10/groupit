import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import './CSS/Profile.css'; // Import CSS file
import Playlist from './Playlist';
import UserGroups from './UserGroups';

function Profile() {
    const navigate = useNavigate();
    const { user, logout } = useUser();
    const [userID , setUserID] = useState('');
    const [userData, setUserData] = useState(null);
    const [songs, setSongs] = useState([]);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        userName: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [notificationImage, setNotificationImage] = useState('/Images/notifications.jpeg');
    const [showNotificationPopup, setShowNotificationPopup] = useState(false);


    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`http://localhost:8081/api/user-data/${user.username}`);
                const data = await response.json();

                if (response.ok) {
                    setUserData(data);
                    setFormData({
                        firstName: data.firstName,
                        lastName: data.lastName,
                        userName: data.userName,
                        email: data.email,
                        password: '' // Do not populate password field for security reasons
                    });
                    setUserID(data.userID)
                } else {
                    console.error('Error fetching user data:', data.message);
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
            }
        };

         const checkNotifications = async () => {
            try {
                const response = await fetch(`http://localhost:8081/check_notification`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username: user.username })
                });
                const data = await response.json();

                if (response.ok) {
                    if (data.hasPendingNotifications) {
                        setNotificationImage('/Images/notifications-on.jpg');
                        setShowNotificationPopup(true);
                        setTimeout(() => {
                            setShowNotificationPopup(false);
                        }, 5000);

                    } else {
                        setNotificationImage('/Images/notifications.jpeg');
                    }
                } else {
                    console.error('Error checking notifications:', data.message);
                }
            } catch (err) {
                console.error('Error checking notifications:', err);
            }
        };

        if (user) {
            fetchUserData();
            checkNotifications();
        }
    }, [user]);


    const handleHomePage = () => {
        navigate(`/HomePage`);
    };

    const handleQuestions = () => {
        navigate(`/Questions`);
    };

    const handleEdit = () => {
        navigate('/EditProfile')
    };

    const handleSignOut = () => {
        logout();
        navigate('/');
    };

    const handleNotification =() =>{
        navigate('/Notifications')
    }

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="background-profile">
            <div>
                <span className={`notification-button ${showNotificationPopup ? 'popup' : ''}`} onClick={handleNotification}>
                    <img src={notificationImage} alt="Notifications" />
                </span>
            </div>
            <div>
                <span className="question-mark-button" onClick={handleQuestions}>
                    <img src="/Images/question.svg" alt="Question" />
                </span>
            </div>
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
                            {userData?.birthday ? formatDate(userData.birthday) : 'Loading...'}
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
                    <Playlist userID={userID}/>
                </div>
                <div className="content-box">
                    <h2>My Groups</h2>
                    <UserGroups userID={userID}/>
                </div>
            </div>
        </div>
    );
}

export default Profile;
