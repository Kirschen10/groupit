import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import './CSS/CreateGroup.css';

const CreateGroup = message => {
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [error, setError] = useState(''); // State for error message
    const [users, setUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [newUser, setNewUser] = useState(null);
    const navigate = useNavigate();
    const [notificationImage, setNotificationImage] = useState('/Images/notifications.jpeg');
    const [showNotificationPopup, setShowNotificationPopup] = useState(false);

    const { user } = useUser();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`http://localhost:8081/api/user-data/${user.username}`);
                const data = await response.json();

                if (response.ok) {
                    setUsers([...users, { username: data.userName, userID: data.userID }]);
            
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

    useEffect(() => {
        // Fetch all users from the backend
        fetch('http://localhost:8081/usersList')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const usersOptions = data.map(user => ({
                    value: user.userID,
                    label: user.userName,
                }));
                setAllUsers(usersOptions);
            })
            .catch(error => {
                console.error('Error fetching users:', error);
                setError('Error fetching user list');
            });
    }, []);    

    const handleAddUser = () => {
        if (newUser) {
            if (users.some(user => user.username === newUser.label)) {
                setError(`User ${newUser.label} is already in the group.`);
                setNewUser(null);
            } else {
                setUsers([...users, { username: newUser.label, userID: newUser.value }]);
                setNewUser(null);
                setError(''); // Clear any previous errors
            }
        }
    };


    const handleCreateGroup = async () => {
        if (groupName === '') {
            setError("Please fill group name.");
            return;  // Stop further execution if group name is empty
        }

        if (groupDescription === '') {
            setError("Please fill group description.");
            return;  // Stop further execution if group description is empty
        }

        if (users.length === 0) {
            setError("Please add at least one user to the group.");
            return;  // Stop further execution if no users are added
        }

        try {
            const response = await axios.post('http://localhost:8081/create-group', {
                groupName,
                groupDescription,
                userName: user.username, // Send userName instead of userID
                users,
            });
            console.log(response)
            if (response.status === 201) {
                const { groupID, createdAt } = response.data;
                alert('Group created successfully!');
                navigate('/GroupDetails', { state: { group: { groupID, groupName, groupDescription, createdAt }, userID: user.userID } }); // Navigate to the group details page with state
            } else {
                console.error('Group creation response:', response.data);
                alert('Failed to create group');
            }
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Failed to create group');
        }
    };

    const handleQuestions = () => {
    navigate(`/Questions`);
    };

    const handleProfile = () => {
        navigate(`/Profile`);
    };

    const handleHomePage = () => {
        navigate(`/HomePage`);
    };

    const handleNotification =() =>{
        navigate('/Notifications')
    }

    return (
    <div className="background-CreateGroup">
        <div>
            <span className={`notification-button ${showNotificationPopup ? 'popup' : ''}`} onClick={handleNotification}>
                <img src={notificationImage} alt="Notifications" />
            </span>
        </div>
        <div>
            <span className="Home-page-button-create" onClick={handleHomePage}>
                <img src="/Images/Logo.svg" alt="Logo" />
            </span>
        </div>
        <div>
            <span className="profile-button-create" onClick={handleProfile}>
                <img src="/Images/user.svg" alt="Profile" />
            </span>
        </div>
        <div>
            <span className="question-mark-button-create" onClick={handleQuestions}>
                <img src="/Images/question.svg" alt="Question" />
            </span>
        </div>
        <div className="create-group-container">
            <h2>Create New Group</h2>
            <form onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                    <label>Group Name:</label>
                    <input
                        type="text"
                        maxLength="50"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Group Description:</label>
                    <textarea
                        maxLength="255"
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                        required
                    ></textarea>
                <br />
                        <Select
                            options={allUsers}
                            value={newUser}
                            onChange={setNewUser}
                            placeholder="Enter user name"
                            isClearable
                            className="add-user-select"
                        />
                        <button type="button" className="add-user-button" onClick={handleAddUser}>Add</button>
                </div>
                <div className="added-users">
                    <h4>Added Users:</h4>
                    <ul>
                        {users.map((user, index) => (
                            <li key={index}>{user.username}</li>
                        ))}
                    </ul>
                </div>
                <button className={"button-CreateGroup"} type="button" onClick={handleCreateGroup}>Create Group</button>
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
        </div>
    );
};

export default CreateGroup;
