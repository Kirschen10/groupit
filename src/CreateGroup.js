import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import './CSS/CreateGroup.css';

const CreateGroup = () => {
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState(''); // State for error message
    const [users, setUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [newUser, setNewUser] = useState(null);
    const navigate = useNavigate();

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
                    value: user,
                    label: user,
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
            const response = await axios.post('http://localhost:8081/api/create-group', {
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

    return (
    <div className="background-CreateGroup">
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
