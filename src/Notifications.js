import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import './CSS/Notifications.css'; // Create and import a CSS file for styling
import axios from 'axios';

function Notifications() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [notifications, setNotifications] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [showRejoinPopup, setShowRejoinPopup] = useState(false);
    const [showGoToGroupPopup, setShowGoToGroupPopup] = useState(false);
    const [currentNotification, setCurrentNotification] = useState(null);
    const [popupMessage, setPopupMessage] = useState('');

    useEffect(() => {

        const fetchInitialNotifications = async () => {
            try {
                const response = await fetch(`http://localhost:8081/get_notifications`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username: user.username, page: 1 })
                });
                const data = await response.json();

                if (response.ok) {
                    setNotifications(data.notifications);
                    setHasMore(data.hasMore);
                } else {
                    console.error('Error fetching notifications:', data.message);
                }
            } catch (err) {
                console.error('Error fetching notifications:', err);
            }
        };

        if (user) {
            setNotifications([]);  // Reset notifications state
            setPage(1);            // Reset page state
            fetchInitialNotifications();
        }
    }, [user]);

    useEffect(() => {
        if (page === 1) return;  // Skip fetching more notifications on the initial load

        const fetchMoreNotifications = async () => {
            try {
                const response = await fetch(`http://localhost:8081/get_notifications`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username: user.username, page })
                });
                const data = await response.json();

                if (response.ok) {
                    setNotifications(prevNotifications => [...prevNotifications, ...data.notifications]);
                    setHasMore(data.hasMore);
                } else {
                    console.error('Error fetching notifications:', data.message);
                }
            } catch (err) {
                console.error('Error fetching notifications:', err);
            }
        };

        fetchMoreNotifications();
    }, [page]);

    const handleApprove = async (askedUser, askingUser, groupID) => {
        try {
            const response = await fetch(`http://localhost:8081/update_notification_status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ askedUser, askingUser, groupID, status: 'approved' })
            });

            if (response.ok) {
                setNotifications(notifications.map(n =>
                    n.askedUser === askedUser && n.askingUser === askingUser && n.groupID === groupID
                    ? { ...n, status: 'approved' }
                    : n
                ));
            } else {
                console.error('Error updating notification status');
            }
        } catch (err) {
            console.error('Error updating notification status:', err);
        }
    };

    const handleRefuse = async (askedUser, askingUser, groupID) => {
        try {
            const response = await fetch(`http://localhost:8081/update_notification_status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ askedUser, askingUser, groupID, status: 'refused' })
            });

            if (response.ok) {
                setNotifications(notifications.map(n =>
                    n.askedUser === askedUser && n.askingUser === askingUser && n.groupID === groupID
                    ? { ...n, status: 'refused' }
                    : n
                ));
            } else {
                console.error('Error updating notification status');
            }
        } catch (err) {
            console.error('Error updating notification status:', err);
        }
    };

    const handleGoToGroup = async (notification) => {
        setCurrentNotification(notification);
        try {
            // Fetch userID
            const userResponse = await axios.post('http://localhost:8081/api/verify-user', { username: user.username });
            if (userResponse.data.exists) {
                const userID = userResponse.data.userID;

                // Check if the user is still a member of the group
                const membershipResponse = await axios.post('http://localhost:8081/check-group-membership', { userID, groupID: notification.groupID });
                if (membershipResponse.data.isMember) {
                    // Fetch group details
                    const groupResponse = await axios.post('http://localhost:8081/get-group-details', { groupID: notification.groupID });
                    if (groupResponse.data.success) {
                        navigate('/GroupDetails', { state: { group: groupResponse.data.group, userID } });
                    } else {
                        console.error('Error fetching group details:', groupResponse.data.message);
                    }
                } else {
                    // Show rejoin popup
                    setPopupMessage('You are no longer a member of this group. Would you like to rejoin?');
                    setShowRejoinPopup(true);
                }
            } else {
                console.error('User not found');
            }
        } catch (error) {
            console.error('Error checking group membership or fetching group details:', error);
        }
    };

    const handleRejoinGroup = async () => {
        setShowRejoinPopup(false);
        try {
            // Rejoin the group
            const rejoinResponse = await axios.post('http://localhost:8081/join-group', { groupID: currentNotification.groupID, userName: user.username });
            if (rejoinResponse.status === 200) {
                // Show confirmation popup
                    setPopupMessage('Successfully joined the group. Would you like to go to the group page or stay on this page?');
                    setShowGoToGroupPopup(true);
            }
        }catch (error) {
            console.error('Error rejoining group:', error);
        }
    };

    const handleConfirmGoToGroup = async () => {
        setShowGoToGroupPopup(false);
        try {
            const userResponse = await axios.post('http://localhost:8081/api/verify-user', { username: user.username });
            if (userResponse.data.exists) {
                const userID = userResponse.data.userID;
                const groupResponse = await axios.post('http://localhost:8081/get-group-details', { groupID: currentNotification.groupID });
                if (groupResponse.data.success) {
                    navigate('/GroupDetails', { state: { group: groupResponse.data.group, userID } });
                } else {
                    console.error('Error fetching group details:', groupResponse.data.message);
                }
            }else {
                console.error('Error fetching userID data.', userResponse.data.message);
                }
        } catch (error) {
            console.error('Error fetching group details:', error);
        }
    };


    const handleCancelPopup = () => {
        setShowRejoinPopup(false);
        setShowGoToGroupPopup(false);
    };

    const loadMore = () => {
        setPage(prevPage => prevPage + 1);
    };

    const handleProfile = () => {
        navigate(`/Profile`);
    };

    const handleHomePage = () => {
        navigate(`/HomePage`);
    };

    const handleQuestions = () => {
        navigate(`/Questions`);
    };


    return (
        <div className="background-faq">
            <div>
                <span className="Home-page-button" onClick={handleHomePage}>
                    <img src="/Images/Logo.svg" alt="Logo" />
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
            <div className="notifications-container">
                <h1>Notifications</h1>
                {notifications.map(notification => (
                    <div key={`${notification.askedUser}-${notification.askingUser}-${notification.groupID}-${notification.status}`} className="notification-card">
                        {notification.status === 'pending' && (
                            <>
                                <p>New request from {notification.askingUserName} to join group {notification.groupName} on {new Date(notification.notificationTimestamp).toLocaleString()}</p>
                                <button className="button-notifications-page" onClick={() => handleApprove(notification.askedUser, notification.askingUser, notification.groupID)}>Approve</button>
                                <button className="button-notifications-page" onClick={() => handleRefuse(notification.askedUser, notification.askingUser, notification.groupID)}>Refuse</button>
                            </>
                        )}
                        {notification.status === 'refused' && (
                            <p>You refused a request from {notification.askingUserName} on {new Date(notification.notificationTimestamp).toLocaleString()} to join group {notification.groupName}</p>
                        )}
                        {notification.status === 'approved' && (
                            <>
                                <p>You joined group {notification.groupName} after a request from {notification.askingUserName} on {new Date(notification.notificationTimestamp).toLocaleString()}</p>
                                <button onClick={() => handleGoToGroup(notification)}>Go To Group</button>
                            </>
                        )}
                    </div>
                ))}
                {hasMore && <button onClick={loadMore}>Load More</button>}
            </div>
            {showRejoinPopup && (
                <div className="popup-notifications-container">
                    <div className="popup-notifications-box">
                        <h2>{popupMessage}</h2>
                        <div className="popup-notifications-buttons">
                            <button className="popup-notifications-button-confirm" onClick={handleRejoinGroup}>Yes</button>
                            <button className="popup-notifications-button-cancel" onClick={handleCancelPopup}>No</button>
                        </div>
                    </div>
                </div>
            )}
            {showGoToGroupPopup && (
                <div className="popup-notifications-container">
                    <div className="popup-notifications-box">
                        <h2>{popupMessage}</h2>
                        <div className="popup-notifications-buttons">
                            <button className="popup-notifications-button-confirm" onClick={handleConfirmGoToGroup}>Go to Group</button>
                            <button className="popup-notifications-button-cancel" onClick={handleCancelPopup}>Stay Here</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Notifications;
