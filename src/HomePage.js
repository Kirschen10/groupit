import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/HomePage.css'; // Import CSS file
import {useUser} from "./UserContext";


function HomePage() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [notificationImage, setNotificationImage] = useState('/Images/notifications.jpeg');
    const [showNotificationPopup, setShowNotificationPopup] = useState(false);

    useEffect(() => {
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
            checkNotifications();
        }
    }, [user]);

    const handleProfile = () => {
        navigate(`/Profile`);
    };

    const handleQuestions = () => {
        navigate(`/Questions`);
    };

    const handleCreateGroup = () => {
        navigate('/CreateGroup');
    };

    const handleJoinGroup = () => {
        navigate('/JoinGroup');
    };

    const handleNotification =() =>{
        navigate('/Notifications')
    }

    return (
        <div className="background-homePage">
            <div>
                <span className={`notification-button ${showNotificationPopup ? 'popup' : ''}`} onClick={handleNotification}>
                    <img src={notificationImage} alt="Notifications" />
                </span>
            </div>
            <div>
                <span className="profile-button" onClick={handleProfile}>
                    <img src="/Images/user.svg" alt="Profile" />
                </span>
            </div>
            <div>
                <span className="question-mark-button" onClick={handleQuestions}>
                    <img src="/Images/question.svg" alt="Question" />
                </span>
            </div>
            <h1 className="headline">What do you<br />wanna do today?</h1>
            <div className="button-container">
                <button className="create-group-button" onClick={handleCreateGroup}>
                    <img src="/Images/Create Group Button.svg" alt="Create Group" />
                </button>
                <button className="join-group-button" onClick={handleJoinGroup}>
                    <img src="/Images/Join Group Button.svg" alt="Join Group" />
                </button>
            </div>
        </div>
    );
}

export default HomePage;
