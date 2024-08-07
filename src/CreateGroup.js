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
    const [notificationImage, setNotificationImage] = useState('/Images/Notification.svg');
    const [showNotificationPopup, setShowNotificationPopup] = useState(false);
    const [userID, setUserID] = useState(null);

    const { user } = useUser();

    useEffect(() => {
        const fetchUserID = async () => {
            try {
                const response = await axios.post('http://localhost:8081/api/verify-user', { username: user.username });
                if (response.data.exists) {
                    setUserID(response.data.userID);
                } else {
                    console.error('Error fetching user ID:', response.data.message);
                }
            } catch (error) {
                console.error('Error fetching user ID:', error);
            }
        };

        if (user) {
            fetchUserID();
        }
    }, [user]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`http://localhost:8081/api/user-data/${user.username}`);
                const data = await response.json();

                if (response.ok) {
                    if (users !== []){
                        setUsers([...users, { username: data.userName, userID: data.userID }]);
                    }
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
                        setNotificationImage('/Images/Notification on.svg');
                        setShowNotificationPopup(true);
                        setTimeout(() => {
                            setShowNotificationPopup(false);
                        }, 5000);

                    } else {
                        setNotificationImage('/Images/Notification.svg');
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
         const fetchAllUsers = async () => {
            try {
                const response = await fetch('http://localhost:8081/usersList');
                const data = await response.json();
                const usersOptions = data.map(user => ({
                    value: user.userID,
                    label: user.userName,
                }));
                setAllUsers(usersOptions);
            } catch (error) {
                console.error('Error fetching users:', error);
                setError('Error fetching user list');
            }
        };
        fetchAllUsers();
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

    const handleRemoveUser = (username) => {
        const updatedUsers = users.filter(user => user.username !== username);
        setUsers(updatedUsers);
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
                navigate('/GroupDetails', { state: { group: { groupID, groupName, groupDescription, createdAt }, userID } }); // Navigate to the group details page with state
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

    const availableUsers = allUsers.filter(user => !users.some(selectedUser => selectedUser.userID === user.value));

    return (
    <div className="background-CreateGroup">
        <div>
            <span className={`notification-button ${showNotificationPopup ? 'popup' : ''}`} onClick={handleNotification}>
                <img src={notificationImage} alt="Notifications" />
            </span>
        </div>
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
                </div>
                <div className="user-add-container">
                    <Select
                        options={availableUsers}
                        value={newUser}
                        onChange={setNewUser}
                        placeholder="Enter user name"
                        isClearable
                        className="react-select"
                        classNamePrefix="react-select"
                    />
                    <button type="button" className="add-user-button" onClick={handleAddUser}>Add</button>
                </div>
                <div className="user-add-container">
                    <div className="added-users">
                        <h4>Added Users:</h4>
                        <ul>
                            {users.map((user, index) => (
                                <li key={index}>
                                    {user.username}
                                    <button type="button" className="remove-user-creategroup-button" onClick={() => handleRemoveUser(user.username)}>x</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <button className={"button-CreateGroup"} onClick={handleCreateGroup}>
                    <img src="/Images/Create Group.svg" alt="Create Group" />
                </button>
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
        </div>
    );
};

export default CreateGroup;

