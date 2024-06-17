import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Select from 'react-select';
import './CSS/GroupDetails.css'; // Import CSS file

const GroupDetails = () => {
    const location = useLocation();
    const { group } = location.state;
    console.log(group);
    const [newUser, setNewUser] = useState(null);
    const [users, setUsers] = useState([]); // Initially empty
    const [allUsers, setAllUsers] = useState([]); // All users from DB
    const [showModal, setShowModal] = useState(false); // State for showing modal
    const [feedbackMessage, setFeedbackMessage] = useState(''); // State for feedback message
    const [errorAllUsersMessage, setAllUsersErrorMessage] = useState(''); // State for error message
    const [errorGroupUsersMessage, setErrorGroupUsersMessage] = useState(''); // State for error message

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
                setAllUsersErrorMessage('Error fetching user list');
            });

        // Fetch group members from the backend
        fetch('http://localhost:8081/groupMembers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ groupId: group.id }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setUsers(data);
            })
                .catch(error => {
                    console.error('Error fetching group members:', error);
                    setErrorGroupUsersMessage('Error fetching group members');
                });
        }, [group.id]);

    const handleAddUser = () => {
        if (newUser) {
            fetch('http://localhost:8081/addUserByUserName', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userName: newUser.value, groupId: group.id }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message === 'User added to group successfully') {
                        setUsers([...users, newUser.label]);
                        setNewUser(null);
                        setFeedbackMessage('User added to group successfully.');
                        setAllUsersErrorMessage('');
                    } else {
                        setFeedbackMessage(`Error: ${data.message}`);
                    }
                })
                .catch(error => {
                    console.error('Error adding user to group:', error);
                    setFeedbackMessage('An error occurred while adding the user to the group.');
                });
        }
    };

    const handleLeaveGroup = () => {
        setShowModal(true);
    };

    const confirmLeaveGroup = () => {
        // Logic to leave the group
        console.log('Left the group');
        setShowModal(false);
        setFeedbackMessage('You have left the group.');
    };

    const cancelLeaveGroup = () => {
        setShowModal(false);
    };

    const handleGetPlaylist = () => {
        // Logic to get the playlist
        console.log('Get playlist');
    };

    return (
        <div className="background-group-details">
            <div className="group-details-container">
                <h1 className="group-header">{group.groupName}</h1>
                <div className="group-info group-info-row">
                    <span><strong>Description:</strong> {group.groupDescription}</span>
                    <span><strong>Group user Count:</strong> {group.userCount}</span>
                </div>
                <div className="group-info group-info-row">
                    <span><strong>Group ID:</strong> {group.groupID}</span>
                    <span><strong>Date of Formation:</strong> {new Date(group.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="group-actions">
                    <button onClick={handleLeaveGroup}>Leave Group</button>
                </div>
                <div className="add-user-input">
                    <Select
                        options={allUsers}
                        value={newUser}
                        onChange={setNewUser}
                        placeholder="Enter user name"
                        isClearable
                        className="add-user-select" // Apply custom CSS class
                    />
                    <button onClick={handleAddUser}>Add User</button>
                    {errorAllUsersMessage && <p className="error-message">{errorAllUsersMessage}</p>}
                </div>
                <div className="user-list">
                    <h2>Group Members</h2>
                    {errorGroupUsersMessage && <p className="error-message">{errorGroupUsersMessage}</p>}
                    <ul>
                        {users.map((user, index) => (
                            <li key={index}>{user}</li>
                        ))}
                    </ul>
                </div>
                <button className="get-playlist-btn" onClick={handleGetPlaylist}>Get Playlist</button>
                {feedbackMessage && <p className="feedback-message">{feedbackMessage}</p>}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Confirm Leave Group</h2>
                        <p>Are you sure you want to leave the group?<br /> This action cannot be undone.</p>
                        <div className="modal-buttons">
                            <button className="modal-button modal-cancel-button" onClick={cancelLeaveGroup}>Cancel</button>
                            <button className="modal-button" onClick={confirmLeaveGroup}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupDetails;
