import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import './CSS/GroupDetails.css'; // Import CSS file

const GroupDetails = () => {
    const location = useLocation();
    const navigate = useNavigate(); // Initialize navigate
    const { group, userID } = location.state;
    const [newUser, setNewUser] = useState(null);
    const [users, setUsers] = useState([]); // Initially empty
    const [allUsers, setAllUsers] = useState([]); // All users from DB
    const [showModal, setShowModal] = useState(false); // State for showing modal
    const [showSuccessModal, setShowSuccessModal] = useState(false); // State for showing success modal
    const [feedbackMessage, setFeedbackMessage] = useState(''); // State for feedback message
    const [errorAllUsersMessage, setAllUsersErrorMessage] = useState(''); // State for error message
    const [errorGroupUsersMessage, setErrorGroupUsersMessage] = useState(''); // State for error message
    const [countdown, setCountdown] = useState(5); // Countdown state
    const [playlist, setPlaylist] = useState([]); // State for playlist
    const [likedSongs, setLikedSongs] = useState({}); // State to track liked songs
    const [loading, setLoading] = useState(false); // State for loading indicator


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
                setAllUsersErrorMessage('Error fetching user list');
            });

        // Fetch group members from the backend
        fetch('http://localhost:8081/groupMembers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ groupId: group.groupID }),
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

        // Fetch group songs on component mount
        fetch('http://localhost:8081/getGroupSongs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ groupID: group.groupID, userID }), // Pass userID in the request
        })
            .then(response => response.json())
            .then(data => {
                setPlaylist(data.groupSongs);
                const likedSongsMap = data.groupSongs.reduce((acc, song) => {
                    acc[song.trackID] = song.isLiked;
                    return acc;
                }, {});
                setLikedSongs(likedSongsMap);
                setLoading(false); // Ensure loading is false after data is fetched
            })
            .catch(error => {
                console.error('Error fetching group songs:', error);
            });
    }, [group.groupID, userID]);

    const handleAddUser = () => {
        if (newUser) {
            fetch('http://localhost:8081/addUserByUserName', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userName: newUser.label, groupId: group.groupID }),
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
        fetch('http://localhost:8081/leave-group', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userID, groupID: group.groupID }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Successfully left the group') {
                    setShowModal(false);
                    setFeedbackMessage('You have left the group.');
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
                    setFeedbackMessage(`Error: ${data.message}`);
                }
            })
            .catch(error => {
                console.error('Error leaving group:', error);
                setFeedbackMessage('An error occurred while leaving the group.');
            });
    };

    const cancelLeaveGroup = () => {
        setShowModal(false);
    };

    const handleGetPlaylist = () => {
        setLoading(true); // Set loading to true
        setPlaylist([]); // Clear current playlist

        fetch('http://localhost:8081/getPlaylist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ groupID: group.groupID }),
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
                    body: JSON.stringify({ userID, groupID: group.groupID, trackIDs }),
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
            body: JSON.stringify({ userID, trackID, groupID: group.groupID }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Response from server:', data);
                if (data.message === 'Feedback removed') {
                    setFeedbackMessage('Feedback removed successfully.');
                    setLikedSongs({ ...likedSongs, [trackID]: false }); // Update the liked state
                } else {
                    setFeedbackMessage(`Error: ${data.message}`);
                }
            })
            .catch(error => {
                console.error('Error removing feedback:', error);
                setFeedbackMessage('An error occurred while removing feedback.');
            });
    } else {
        // If not liked, add feedback
        fetch('http://localhost:8081/giveFeedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userID, trackID, groupID: group.groupID }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Response from server:', data);
                if (data.message === 'Feedback recorded') {
                    setFeedbackMessage('Feedback recorded successfully.');
                    setLikedSongs({ ...likedSongs, [trackID]: true }); // Update the liked state
                } else {
                    setFeedbackMessage(`Error: ${data.message}`);
                }
            })
            .catch(error => {
                console.error('Error giving feedback:', error);
                setFeedbackMessage('An error occurred while giving feedback.');
            });
    }
};

    return (
        <div className="background-group-details">
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
            <div className="group-details-container">
                <h1 className="group-header">{group.groupName}</h1>
                <div className="group-info">
                    <span>{group.groupDescription}</span>
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
                <h2>Group's Playlist</h2>
                {loading && <div className="loading-indicator"><div className="spinner"></div></div>}
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
                                                    </div>

                            </div>
                        ))}
                    </ul>
                </div>
                {feedbackMessage && <p className="feedback-message">{feedbackMessage}</p>}
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
