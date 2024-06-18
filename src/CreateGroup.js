import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import './CSS/CreateGroup.css';

const CreateGroup = () => {
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [error, setError] = useState(''); // State for error message
    const [users, setUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [newUser, setNewUser] = useState(null);
    const navigate = useNavigate();

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

        if (user) {
            fetchUserData();
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
                users,
            });
            alert('Group created successfully!');
            navigate('/HomePage');
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Failed to create group');
        }
    };

    const handleProfile = () => {
        navigate(`/Profile`);
    };

    const handleHomePage = () => {
        navigate(`/HomePage`);
    };

    return (
    <div className="background-CreateGroup">
         <div>
                <span className="profile-CreateGroup-button" onClick={handleProfile}>
                    <img src="/Images/user.svg" alt="Profile" />
                </span>
            </div>
            <div>
            <span className="Home-Page-CreateGroup-button" onClick={handleHomePage}>
                <img src="/Images/Logo.svg" alt="Logo" />
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
                      <div className="form-group flex">
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
