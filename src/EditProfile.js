import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import './CSS/EditProfile.css'; // Import CSS file


function EditProfile() {
    const navigate = useNavigate();
    const { user, logout } = useUser();
    const [userID , setUserID] = useState('');
    const [userData, setUserData] = useState(null);
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
        }
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


        const handleChange = (e) => {
            const {name, value} = e.target;
            setFormData({
                ...formData,
                [name]: value
            });
        };

        const handleCancel = (e) => {
            navigate('/Profile');
        }

        const handleSubmit = async (e) => {
            e.preventDefault();
            setError('');

            // Perform any necessary validation here
            if (formData.userName !== userData.userName) {
                // Check if the username is unique
                const checkResponse = await fetch(`http://localhost:8081/api/check-username/${formData.userName}`);
                const checkData = await checkResponse.json();

                if (!checkResponse.ok) {
                    setError('Username is already taken.');
                    return;
                }
            }


            // Submit the updated data to the server
            const response = await fetch(`http://localhost:8081/api/update-user/${user.username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setUserData({
                    ...userData,
                    ...formData,
                    password: undefined // Keep the password field secure
                });
            } else {
                const data = await response.json();
                setError(data.message || 'Error updating profile');
            }

            navigate('/Profile');
        };

        const formatDate = (dateString) => {
            const options = {year: 'numeric', month: 'long', day: 'numeric'};
            return new Date(dateString).toLocaleDateString(undefined, options);
        };

        const handleNotification =() =>{
            navigate('/Notifications')
        }

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
            <div className="info-container-edit">
                {/*<form onSubmit={handleSubmit}>*/}
                    {error && <p className="error">{error}</p>}
                    <h2>Edit Personal Information</h2>
                    <div className="info-content-edit">
                        <div>
                            <p>
                                <span className="label">First Name: </span>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </p>
                        </div>
                        <div>
                            <p>
                                <span className="label">Last Name: </span>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </p>
                        </div>
                        <div>
                            <p>
                                <span className="label">User Name: </span>
                                <input
                                    type="text"
                                    name="userName"
                                    value={formData.userName}
                                    onChange={handleChange}
                                    required
                                />
                            </p>
                        </div>
                        <div>
                            <p>
                                <span className="label">Email: </span>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </p>
                        </div>
                        <div>
                            <p>
                                <span className="label">Password: </span>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </p>
                        </div>
                    </div>
                    <div className="buttons">
                        <button type="submit" onClick={handleSubmit}>Save</button>
                        <button type="button" onClick={handleCancel}>Cancel</button>
                    </div>
                {/*</form>*/}
            </div>
        </div>
    );
}

export default EditProfile;
