import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CSS/CreateGroup.css';

const CreateGroup = () => {
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [username, setUsername] = useState('');
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    const handleAddUser = async () => {
        if (username && !users.some(user => user.username === username)) {
            try {
                const response = await axios.post('http://localhost:8081/api/verify-user', { username });
                if (response.data.exists) {
                    setUsers([...users, { username, userID: response.data.userID }]);
                    setUsername('');
                } else {
                    alert('Username does not exist');
                }
            } catch (error) {
                console.error('Error verifying user:', error);
                alert('Error verifying user');
            }
        }
    };

    const handleCreateGroup = async () => {
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

    const backgroundStyle = {
        backgroundImage: `url('/Images/Background_HomePage.svg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh', // Set minimum height to cover the entire viewport
    };

    return (
    <div  style={backgroundStyle}>
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
                <div className="form-group">
                    <label>Add People:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <button type="button" onClick={handleAddUser}>Add</button>
                </div>
                <div className="added-users">
                    <h4>Added Users:</h4>
                    <ul>
                        {users.map((user, index) => (
                            <li key={index}>{user.username}</li>
                        ))}
                    </ul>
                </div>
                <button type="button" onClick={handleCreateGroup}>Create Group</button>
            </form>
        </div>
        </div>
    );
};

export default CreateGroup;
