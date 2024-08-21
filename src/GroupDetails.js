import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import './CSS/GroupDetails.css';
import {useUser} from "./UserContext";
import Notifications from "./Notifications";

const GroupDetails = () => {
    const location = useLocation();
    const navigate = useNavigate(); // Initialize navigate
    const { user } = useUser();
    const { group, userID } = location.state;
    const [currentGroup, setCurrentGroup] = useState(group); // Initialize group state
    const [newUser, setNewUser] = useState(null);
    const [users, setUsers] = useState([]); // Initially empty
    const [pendingUsers, setPendingUsers] = useState([]);
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
    const [notificationImage, setNotificationImage] = useState('/Images/Notification.svg');
    const [showNotificationPopup, setShowNotificationPopup] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

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

        // Fetch pending users from the backend
        fetch('http://localhost:8081/pendingUsers', {
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
                setPendingUsers(data);
            })
            .catch(error => {
                console.error('Error fetching pending users:', error);
                setErrorWithTimeout(setErrorGroupUsersMessage, 'Error fetching pending users');
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
                        setNotificationImage('/Images/Notifications on.svg');
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
            checkNotifications();
        }
    }, [user]);

    // Filter users who are not in the group and not pending
    const availableUsers = allUsers.filter(user =>
        !users.includes(user.label) &&
        !pendingUsers.includes(user.label)
    );

    const handleAddUser = () => {
    resetFeedbackMessage();
    if (newUser) {
        fetch('http://localhost:8081/askUserByUserName', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userName: newUser.label,
                groupId: currentGroup.groupID,
                askingUserName: user.username
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Notification sent successfully') {
                    setPendingUsers([...pendingUsers, newUser.label]);
                    setNewUser(null);
                    setErrorWithTimeout(setAddUserFeedbackMessage, 'The user got a request to join the group');
                    setErrorWithTimeout(setAddUserErrorMessage, ``);
                } else {
                    setErrorWithTimeout(setAddUserErrorMessage, `Error: ${data.message}`);
                }
            })
            .catch(error => {
                console.error('Error asking the user to join the group:', error);
                setErrorWithTimeout(setAddUserErrorMessage, 'An error occurred while asking the user to join the group.');
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

        // Clear liked and unliked songs states
        setLikedSongs({});
        setUnlikedSongs({});

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
                        if (feedbackData && feedbackData.feedbackData) {
                            console.log('Fetched feedback:', feedbackData); // Debug log
                            const updatedLikedSongs = {};
                            const updatedUnlikedSongs = {};
                            feedbackData.feedbackData.forEach(feedback => {
                                updatedLikedSongs[feedback.trackID] = feedback.isLiked;
                                updatedUnlikedSongs[feedback.trackID] = feedback.isUnliked;
                            });

                            setLikedSongs(updatedLikedSongs);
                            setUnlikedSongs(updatedUnlikedSongs);
                        } else {
                            console.error('Feedback data is not in the expected format:', feedbackData);
                        }
                    setLoading(false); // Set loading to false after all operations are done

                    })
                    .catch(error => {
                        console.error('Error processing feedback data:', error);
                        setLoading(false); // Set loading to false in case of error
                    });
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

    const handleNotification =() =>{
        setShowNotifications(true);
    };

    const closeNotificationPopup = () => {
        setShowNotifications(false);
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
            <span className="Home-page-button" onClick={handleHomePage}>
                <img src="/Images/Logo.svg" alt="Logo" />
            </span>
        </div>
        <div className="top-buttons-container">
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
        </div>
        {isEditing ? (
            <form onSubmit={handleSaveClick} className="info-container-edit">
            <h2>Edit Group Information</h2>
            <div className="info-content-edit">
                <div>
                    <p>
                        <span className="label">Group Name:</span>
                        <input
                            type="text"
                            name="groupName"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                    </p>
                </div>
                <div>
                    <p>
                        <span className="label">Group Description:</span>
                        <input
                            type="text"
                            name="groupDescription"
                            value={groupDescription}
                            onChange={(e) => setGroupDescription(e.target.value)}
                        />
                    </p>
                </div>
                <div className="buttons">
                        <button onClick={handleSaveClick} type="submit">Save</button>
                        <button onClick={handleCancelClick} type="button">Cancel</button>
                </div>
            </div>
            </form>
        ) : (
            <div className="group-details-container">
                <span className="group-header"> {currentGroup.groupName} </span>
                <span className="group-info">{currentGroup.groupDescription}</span>
                <div className="group-info-row">
                    <span><strong>Group ID:</strong> {currentGroup.groupID}</span>
                    <span><strong>Date of Formation:</strong> {new Date(currentGroup.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="buttons">
                    <button onClick={handleEditClick}>
                        <img src="/Images/edit icon.svg" alt="Edit" /> Edit
                    </button>
                    <button onClick={handleLeaveGroup}>
                        <img src="/Images/sign out icon.svg" alt="Leave Group" /> Leave Group
                    </button>
                    {leaveGroupFeedbackMessage && <p className="feedback-message">{leaveGroupFeedbackMessage}</p>}
                </div>
            </div>
            )}
            {groupUpdateFeedbackMessage && <p className="feedback-message">{groupUpdateFeedbackMessage}</p>}

        <div className="content-container">
            <div className="content-box">
                <h2>Group's Playlist</h2>
                {loading && <div className="loading-indicator"><div className="spinner"></div></div>}
                {playlist.length === 0 && !loading ? (
                    <div className="no-playlist-found">
                        <p>This group doesn't have a playlist yet. Feel free to generate one :)</p>
                        <img src="/Images/not fount.svg" alt="Sad Smiley" />
                    </div>
                ) : (
                    <div className="play-list-container">
                        {playlist.map((song, index) => (
                            <div key={index} className="song-card">
                                <div className="song-info">
                                    <span className="song-name">{song.trackName}</span>
                                    <span className="song-artist">{song.artistName}</span>
                                    <span className="like-button" onClick={() => handleStarClick(song.trackID)}>
                                        <img src={likedSongs[song.trackID] ? "/Images/like.svg" : "/Images/empty like.svg"}
                                            alt="Like" />
                                    </span>
                                    <span className="unlike-button" onClick={() => handleUnlikeClick(song.trackID)}>
                                        <img src={unlikedSongs[song.trackID] ? "/Images/unlike.png" : "/Images/empty unlike.svg"}
                                            alt="Unlike" />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <button className="get-playlist-btn" onClick={handleGetPlaylist}>Refresh Our Playlist</button>
            </div>
            <div className="content-box">
                <div className="user-list">
                    <h2>Group Members</h2>
                    {errorGroupUsersMessage && <p className="error-message">{errorGroupUsersMessage}</p>}
                    <ul>
                        {users.map((user, index) => (
                            <li key={index}>{user}</li>
                        ))}
                    </ul>
                </div>
                <h3>Invite someone to join</h3>
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
                        className="add-user-select-GD" // Apply custom CSS class
                        classNamePrefix="add-user-select-GD"
                    />
                    <button onClick={handleAddUser}>Add User</button>
                    {addUserErrorMessage && <p className="error-message">{addUserErrorMessage}</p>}
                    {addUserFeedbackMessage && <p className="feedback-message">{addUserFeedbackMessage}</p>}
                </div>
                <div className="user-list">
                    <h2>Waiting for Response</h2>
                    <ul>
                        {pendingUsers.map((user, index) => (
                            <li key={index}>{user}</li>
                        ))}
                    </ul>
                </div>

                <div className="all-users">
                    {errorAllUsersMessage && <p className="error-message">{errorAllUsersMessage}</p>}
                </div>
            </div>
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
        {showNotifications && (
                <div className="popup-overlay">
                    <Notifications onClose={closeNotificationPopup} /> {/* Render the Notifications component */}
                </div>
            )}
    </div>
);

};

export default GroupDetails;
