import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import './CSS/GroupDetails.css'; // Import CSS file

const GroupDetails = () => {
    const location = useLocation();
    const navigate = useNavigate(); // Initialize navigate
    const { group, userID } = location.state;
    const [currentGroup, setCurrentGroup] = useState(group); // Initialize group state
    const [newUser, setNewUser] = useState(null);
    const [users, setUsers] = useState([]); // Initially empty
    const [allUsers, setAllUsers] = useState([]); // All users from DB
    const [showModal, setShowModal] = useState(false); // State for showing modal
    const [showSuccessModal, setShowSuccessModal] = useState(false); // State for showing success modal
    const [feedbackMessage, setFeedbackMessage] = useState(''); // State for feedback message
    const [errorAllUsersMessage, setAllUsersErrorMessage] = useState(''); // State for error message
    const [errorGroupUsersMessage, setErrorGroupUsersMessage] = useState(''); // State for error message
    const [addUserErrorMessage, setAddUserErrorMessage] = useState('');
    const [countdown, setCountdown] = useState(5); // Countdown state
    const [playlist, setPlaylist] = useState([]); // State for playlist
    const [likedSongs, setLikedSongs] = useState({}); // State to track liked songs
    const [unlikedSongs, setUnlikedSongs] = useState({}); // State to track unliked songs
    const [loading, setLoading] = useState(false); // State for loading indicator
    const [addUserFeedbackMessage, setAddUserFeedbackMessage] = useState('');
    const [groupUpdateFeedbackMessage, setGroupUpdateFeedbackMessage] = useState('');
    const [leaveGroupFeedbackMessage, setLeaveGroupFeedbackMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode
    const [groupName, setGroupName] = useState(currentGroup.groupName); // State for group's name
    const [groupDescription, setGroupDescription] = useState(currentGroup.groupDescription); // State for group's description
    const [originalGroupName, setOriginalGroupName] = useState(currentGroup.groupName); // State to store original group's name
    const [originalGroupDescription, setOriginalGroupDescription] = useState(currentGroup.groupDescription); // State to store original group's description

    const resetFeedbackMessage = () => {
        setFeedbackMessage('');
        setAllUsersErrorMessage('');
        setErrorGroupUsersMessage('');
    };

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
                setErrorWithTimeout(setAllUsersErrorMessage, 'Error fetching user list');
            });

        // Fetch group members from the backend
        fetch('http://localhost:8081/groupMembers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ groupId: currentGroup.groupID }),
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
                setErrorWithTimeout(setErrorGroupUsersMessage, 'Error fetching group members');
            });

        // Fetch group songs on component mount
        fetch('http://localhost:8081/getGroupSongs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ groupID: currentGroup.groupID, userID }), // Pass userID in the request
        })
            .then(response => response.json())
            .then(data => {
                setPlaylist(data.groupSongs);
                const likedSongsMap = data.groupSongs.reduce((acc, song) => {
                    acc[song.trackID] = song.isLiked;
                    return acc;
                }, {});
                const unlikedSongsMap = data.groupSongs.reduce((acc, song) => {
                    acc[song.trackID] = song.isUnliked;
                    return acc;
                }, {});
                setLikedSongs(likedSongsMap);
                setUnlikedSongs(unlikedSongsMap);
                setLoading(false); // Ensure loading is false after data is fetched
            })
            .catch(error => {
                console.error('Error fetching group songs:', error);
            });
    }, [currentGroup.groupID, userID]);

   // Filter users who are not in the group
    const availableUsers = allUsers.filter(user => !users.includes(user.label));

    const handleAddUser = () => {
    resetFeedbackMessage();
    if (newUser) {
        fetch('http://localhost:8081/addUserByUserName', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userName: newUser.label, groupId: currentGroup.groupID }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'User added to group successfully') {
                    setUsers([...users, newUser.label]);
                    setNewUser(null);
                    setErrorWithTimeout(setAddUserFeedbackMessage, 'User added to group successfully.');
                    setErrorWithTimeout(setAddUserErrorMessage, ``);
                } else {
                    setErrorWithTimeout(setAddUserErrorMessage, `Error: ${data.message}`);
                }
            })
            .catch(error => {
                console.error('Error adding user to group:', error);
                setErrorWithTimeout(setAddUserErrorMessage, 'An error occurred while adding the user to the group.');
            });
    }
};

    const handleLeaveGroup = () => {
        resetFeedbackMessage();
        setShowModal(true);
    };

    const confirmLeaveGroup = () => {
        fetch('http://localhost:8081/leave-group', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userID, groupID: currentGroup.groupID }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Successfully left the group') {
                    setShowModal(false);
                    setErrorWithTimeout(setFeedbackMessage, 'You have left the group.');
                    setShowSuccessModal(true);
                    // Start countdown
                    const countdownInterval = setInterval(() => {
                        setCountdown(prevCountdown => {
                            if (prevCountdown === 1) {
                                clearInterval(countdownInterval);
                                navigate('/profile'); // Navigate to the profile page
                            }
                            return prevCountdown - 1;
                        });
                    }, 1000);
                } else {
                    setErrorWithTimeout(setFeedbackMessage, 'Error: ${data.message}');
                }
            })
            .catch(error => {
                console.error('Error leaving group:', error);
                setErrorWithTimeout(setFeedbackMessage, 'An error occurred while leaving the group.');
            });
    };

    const cancelLeaveGroup = () => {
        resetFeedbackMessage();
        setShowModal(false);
    };

    const setErrorWithTimeout = (setErrorFunction, message) => {
        setErrorFunction(message);
        setTimeout(() => {
            setErrorFunction('');
        }, 5000);
    };

    const handleGetPlaylist = () => {
        resetFeedbackMessage();
        setLoading(true); // Set loading to true
        setPlaylist([]); // Clear current playlist

        fetch('http://localhost:8081/getPlaylist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ groupID: currentGroup.groupID }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setPlaylist(data.songs);
                // Get feedback for the tracks in the playlist
                const trackIDs = data.songs.map(song => song.trackID);
                fetch('http://localhost:8081/getFeedbackForTracks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userID, groupID: currentGroup.groupID, trackIDs }),
                })
                    .then(response => response.json())
                    .then(feedbackData => {
                        console.log('Fetched feedback:', feedbackData);
                        const updatedLikedSongs = feedbackData.feedbackTrackIDs.reduce((acc, trackID) => {
                            acc[trackID] = true;
                            return acc;
                        }, {});
                        setLikedSongs(updatedLikedSongs);
                        setLoading(false); // Set loading to false after all operations are done
                    })
            })
            .catch(error => {
                console.error('Error fetching playlist:', error);
                setLoading(false); // Set loading to false in case of error
            });
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

    const handleStarClick = (trackID) => {
        if (likedSongs[trackID]) {
            // If already liked, remove feedback
            fetch('http://localhost:8081/removeFeedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userID, trackID, groupID: currentGroup.groupID }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Response from server:', data);
                    if (data.message === 'Feedback removed') {
                        setErrorWithTimeout(setFeedbackMessage, 'Feedback removed successfully.');
                        setLikedSongs({ ...likedSongs, [trackID]: false }); // Update the liked state
                    } else {
                        setErrorWithTimeout(setFeedbackMessage, 'Error: ${data.message}');
                    }
                })
                .catch(error => {
                    console.error('Error removing feedback:', error);
                    setErrorWithTimeout(setFeedbackMessage, 'An error occurred while removing feedback.');
                });
        } else {
            // If not liked, add feedback
            fetch('http://localhost:8081/givePositiveFeedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userID, trackID, groupID: currentGroup.groupID }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Response from server:', data);
                    if (data.message === 'Feedback recorded') {
                        setErrorWithTimeout(setFeedbackMessage, 'Feedback recorded successfully.');
                        setLikedSongs({ ...likedSongs, [trackID]: true }); // Update the liked state
                        setUnlikedSongs({ ...unlikedSongs, [trackID]: false }); // Ensure unlike is off
                    } else {
                        setErrorWithTimeout(setFeedbackMessage, 'Error: ${data.message}');
                    }
                })
                .catch(error => {
                    console.error('Error giving feedback:', error);
                    setErrorWithTimeout(setFeedbackMessage, 'An error occurred while giving feedback.');
                });
        }
    };

    const handleUnlikeClick = (trackID) => {
        resetFeedbackMessage();
        if (unlikedSongs[trackID]) {
            // If already unliked, remove feedback
            fetch('http://localhost:8081/removeFeedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userID, trackID, groupID: currentGroup.groupID }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Response from server:', data);
                    if (data.message === 'Feedback removed') {
                        setErrorWithTimeout(setFeedbackMessage, 'Feedback removed successfully.');
                        setUnlikedSongs({ ...unlikedSongs, [trackID]: false }); // Update the unliked state
                    } else {
                        setErrorWithTimeout(setFeedbackMessage, 'Error: ${data.message}');
                    }
                })
                .catch(error => {
                    console.error('Error removing feedback:', error);
                    setErrorWithTimeout(setFeedbackMessage, 'An error occurred while removing feedback.');
                });
        } else {
            // If not unliked, add feedback
            fetch('http://localhost:8081/giveNegativeFeedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userID, trackID, groupID: currentGroup.groupID }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Response from server:', data);
                    if (data.message === 'Feedback recorded') {
                        setErrorWithTimeout(setFeedbackMessage, 'Feedback recorded successfully.');
                        setUnlikedSongs({ ...unlikedSongs, [trackID]: true }); // Update the unliked state
                        setLikedSongs({ ...likedSongs, [trackID]: false }); // Ensure like is off
                    } else {
                        setErrorWithTimeout(setFeedbackMessage, 'Error: ${data.message}');
                    }
                })
                .catch(error => {
                    console.error('Error giving feedback:', error);
                    setErrorWithTimeout(setFeedbackMessage, 'An error occurred while giving feedback.');
                });
        }
    };

    const handleEditClick = () => {
        resetFeedbackMessage();
        setIsEditing(true);
    };

    const handleSaveClick = () => {
        resetFeedbackMessage();
        fetch('http://localhost:8081/updateGroup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ groupID: currentGroup.groupID, newName: groupName, newDescription: groupDescription }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Group updated successfully') {
                    setErrorWithTimeout(setFeedbackMessage, 'Group details updated successfully.');
                    setIsEditing(false);
                    setOriginalGroupName(groupName);
                    setOriginalGroupDescription(groupDescription);
                    // Update the currentGroup object in the state to reflect the changes
                    setCurrentGroup(prevGroup => ({
                        ...prevGroup,
                        groupName,
                        groupDescription
                    }));
                } else {
                    setErrorWithTimeout(setFeedbackMessage, 'Error: ${data.message}');
                }
            })
            .catch(error => {
                console.error('Error updating group details:', error);
                setErrorWithTimeout(setFeedbackMessage, 'An error occurred while updating the group details.');
            });
    };

    const handleCancelClick = () => {
        resetFeedbackMessage();
        setGroupName(originalGroupName);
        setGroupDescription(originalGroupDescription);
        setIsEditing(false);
    };

return (
    <div className="background-group-details">
        <div>
            <span className="Home-page-button-group-details" onClick={handleHomePage}>
                <img src="/Images/Logo.svg" alt="Logo" />
            </span>
        </div>
        <div>
            <span className="profile-button-group-details" onClick={handleProfile}>
                <img src="/Images/user.svg" alt="Profile" />
            </span>
        </div>
        <div>
            <span className="question-mark-button-group-details" onClick={handleQuestions}>
                <img src="/Images/question.svg" alt="Question" />
            </span>
        </div>
        <div className="group-details-container">
            <h1 className="group-header">
                {isEditing ? (
                    <div className="edit-group-name">
                        <label>Group name:</label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="edit-input"
                        />
                    </div>
                ) : (
                    currentGroup.groupName
                )}
            </h1>
            <div className="group-info">
                {isEditing ? (
                    <div className="edit-group-description">
                        <label>Group description:</label>
                        <textarea
                            value={groupDescription}
                            onChange={(e) => setGroupDescription(e.target.value)}
                            className="edit-textarea"
                        />
                    </div>
                ) : (
                    <span>{currentGroup.groupDescription}</span>
                )}
            </div>
            {isEditing && (
                <div className="edit-info">
                    <p>Editing Group's Name and Description</p>
                </div>
            )}
            {groupUpdateFeedbackMessage && <p className="feedback-message">{groupUpdateFeedbackMessage}</p>}
            <div className="group-info group-info-row">
                <span><strong>Group ID:</strong> {currentGroup.groupID}</span>
                <span><strong>Date of Formation:</strong> {new Date(currentGroup.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="group-actions">
                {isEditing ? (
                    <>
                        <button onClick={handleSaveClick}>Save</button>
                        <button onClick={handleCancelClick}>Cancel</button>
                    </>
                ) : (
                    <button className="maymay" onClick={handleEditClick}>Edit</button>
                )}
                <button onClick={handleLeaveGroup}>Leave Group</button>
                {leaveGroupFeedbackMessage && <p className="feedback-message">{leaveGroupFeedbackMessage}</p>}
            </div>
            <div className="add-user-input">
                <Select
                    options={availableUsers}
                    value={newUser}
                    onChange={(selectedOption) => {
                        resetFeedbackMessage();
                        setNewUser(selectedOption);
                    }}
                    placeholder="Enter user name"
                    isClearable
                    className="add-user-select" // Apply custom CSS class
                />
                <button onClick={handleAddUser}>Add User</button>
                {addUserErrorMessage && <p className="error-message">{addUserErrorMessage}</p>}
                {addUserFeedbackMessage && <p className="feedback-message">{addUserFeedbackMessage}</p>}
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
            <div className="all-users">
                {errorAllUsersMessage && <p className="error-message">{errorAllUsersMessage}</p>}
            </div>
            <h2>Group's Playlist</h2>
            {loading && <div className="loading-indicator"><div className="spinner"></div></div>}
            {playlist.length === 0 && !loading ? (
                <div className="no-playlist-message">
                    <p>This group doesn't have a playlist. Feel free to generate one :)</p>
                </div>
            ) : (
                <div className="play-list-container-gd">
                    <ul>
                        {playlist.map((song, index) => (
                            <div key={index} className="song-card-gd">
                                <div className="song-info-gd">
                                    <span className="song-name-gd">{song.trackName}</span>
                                    <span className="song-artist-gd">{song.artistName}</span>
                                    <span className="like-button" onClick={() => handleStarClick(song.trackID)}>
                                        <img src={likedSongs[song.trackID] ? "/Images/likeFill.png" : "/Images/like.png"}
                                            alt="Like" />
                                    </span>
                                    <span className="unlike-button" onClick={() => handleUnlikeClick(song.trackID)}>
                                        <img src={unlikedSongs[song.trackID] ? "/Images/unlikeFill.png" : "/Images/unlike.png"}
                                            alt="Unlike" />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </ul>
                </div>
            )}
            <button className="get-playlist-btn" onClick={handleGetPlaylist}>Refresh Our Playlist</button>
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

        {showSuccessModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2>Successfully Left the Group</h2>
                    <p>You have been successfully removed from the group.</p>
                    <p>Redirecting to profile page in <strong>{countdown}</strong></p>
                </div>
            </div>
        )}
    </div>
);

};

export default GroupDetails;
