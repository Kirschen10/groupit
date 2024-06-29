import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import './CSS/JoinGroup.css';

const JoinGroup = () => {
    const [groupID, setGroupID] = useState('');
    const { user } = useUser();
    const [foundGroups, setFoundGroups] = useState([]);
    const [showGroups, setShowGroups] = useState(false);
    const [hoveredGroup, setHoveredGroup] = useState(null);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [userID, setUserID] = useState(null);
    const [groupDetails, setGroupDetails] = useState(null);
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (feedbackMessage) {
            setShowErrorMessage(true);
            const timer = setTimeout(() => {
                setShowErrorMessage(false);
                setFeedbackMessage('');
            }, 5000);

            // Clear timeout if component is unmounted or message changes
            return () => clearTimeout(timer);
        }
    }, [feedbackMessage]);

    useEffect(() => {
        const handleClick = () => {
            setShowErrorMessage(false);
            setFeedbackMessage('');
        };

        // Add event listener for all button clicks
        document.addEventListener('click', handleClick);

        // Cleanup event listener on component unmount
        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, []);

    const handleJoinGroupByID = async () => {
        try {
            const response = await axios.post('http://localhost:8081/join-group', { groupID, userName: user.username });
            if (response.data.message !== 'Successfully joined the group') {
                setFeedbackMessage(response.data.message);
                setShowErrorMessage(true);
            } else if (response.data.message === 'Successfully joined the group') {
                await fetchUserID(user.username);
                await fetchGroupDetails(groupID);
                setShowSuccessModal(true);
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setFeedbackMessage(error.response.data.message);
                setShowErrorMessage(true);
            } else {
                console.error('Error joining group:', error);
                setFeedbackMessage('Failed to join group');
                setShowErrorMessage(true);
            }
        }
    };

    const fetchUserID = async (username) => {
        try {
            const response = await axios.post('http://localhost:8081/api/verify-user', { username });
            if (response.data.exists) {
                setUserID(response.data.userID);
            } else {
                setFeedbackMessage('User ID not found');
                setShowErrorMessage(true);
            }
        } catch (error) {
            console.error('Error fetching user ID:', error);
            setFeedbackMessage('Error fetching user ID');
            setShowErrorMessage(true);
        }
    };

    const fetchGroupDetails = async (groupID) => {
        try {
            const response = await axios.post('http://localhost:8081/get-group-details', { groupID });
            if (response.data.success) {
                setGroupDetails(response.data.group);
            } else {
                setFeedbackMessage('Failed to fetch group details');
                setShowErrorMessage(true);
            }
        } catch (error) {
            console.error('Error fetching group details:', error);
            setFeedbackMessage('Error fetching group details');
            setShowErrorMessage(true);
        }
    };

    const handleFindGroups = async () => {
        try {
            const response = await axios.get('http://localhost:8081/find-groups',
                {
                    params: { username: user.username }
                });
            setFoundGroups(response.data.groups);
        } catch (error) {
            console.error('Error finding groups:', error);
            alert('Failed to find groups');
        }
    };

    const handleToggleGroups = () => {
        handleFindGroups();
        setShowGroups(!showGroups);
    };

    const handleJoinFoundGroup = async (groupID) => {
        try {
            const response = await axios.post('http://localhost:8081/join-group', { groupID, userName: user.username });
            if (response.data.message !== 'Successfully joined the group') {
                setFeedbackMessage(response.data.message);
                setShowErrorMessage(true);
            } else if (response.data.message === 'Successfully joined the group') {
                await fetchGroupDetails(groupID);
                await fetchUserID(user.username);
                setShowSuccessModal(true);
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setFeedbackMessage(error.response.data.message);
                setShowErrorMessage(true);
            } else {
                console.error('Error joining group:', error);
                setFeedbackMessage('Failed to join group');
                setShowErrorMessage(true);
            }
        }
    };

    const handleMouseEnter = (group) => {
        setHoveredGroup(group);
    };

    const handleMouseLeave = () => {
        setHoveredGroup(null);
    };

    const handleStay = () => {
        setShowSuccessModal(false);
    };

    const handleGoToGroup = () => {
        if (userID && groupDetails) {
            navigate('/GroupDetails', { state: { group: groupDetails, userID} });
        } else {
            setFeedbackMessage('something went wrong! please try again');
            setShowErrorMessage(true);
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


    return (
    <div className={"background-join"}>
        <div>
            <span className="Home-page-button-join" onClick={handleHomePage}>
                <img src="/Images/Logo.svg" alt="Logo" />
            </span>
        </div>
        <div>
            <span className="profile-button-join" onClick={handleProfile}>
                <img src="/Images/user.svg" alt="Profile" />
            </span>
        </div>
        <div>
            <span className="question-mark-button-join" onClick={handleQuestions}>
                <img src="/Images/question.svg" alt="Question" />
            </span>
        </div>
        <div className="join-group-container">
            <h2>Join Group</h2>
            <div className="join-group-top">
                <h3 style={{ textAlign: 'left' }}>Join Group by Group ID:</h3>
                <input
                    type="text"
                    value={groupID}
                    onChange={(e) => setGroupID(e.target.value)}
                />
                <button onClick={handleJoinGroupByID}>Join Group</button>
            </div>
            <div className="explore-groups-bottom">
                <h3>Explore Groups with Similar Taste</h3>
                <button onClick={handleToggleGroups}>
                    {showGroups ? 'Close' : 'Find Groups'}
                </button>
                {showGroups && foundGroups.length > 0 && (
                    <ul>
                        {foundGroups.map((group) => (
                            <li key={group.groupID} className="group-card-joingroup">
                                <div className="group-header-joingroup">
                                    <span className="group-name-joingroup">{group.groupName}</span>
                                    <span className="group-id-joingroup">(ID: {group.groupID})</span>
                                </div>
                                <div className="group-buttons-joingroup">
                                    <span
                                        className="info-button-joingroup"
                                        onMouseEnter={() => handleMouseEnter(group)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        Info
                                    </span>
                                    <button
                                        className="join-button-joingroup"
                                        onClick={() => handleJoinFoundGroup(group.groupID)}
                                    >
                                        Join Group
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                {showErrorMessage && feedbackMessage && <p className="feedback-message-JoinGroup">{feedbackMessage}</p>}
            </div>
        </div>
        {hoveredGroup && (
            <div className="group-details-joingroup visible">
                <h3>{hoveredGroup.groupName}</h3>
                <p>{hoveredGroup.groupDescription}</p>
                <div className="detail-item-joingroup">
                    <span>ID:</span>
                    <span className="value">{hoveredGroup.groupID}</span>
                </div>
                <div className="detail-item-joingroup">
                    <span>Created At:</span>
                    <span className="value">{new Date(hoveredGroup.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="detail-item-joingroup">
                    <span>Group Members:</span>
                    <span className="value">{hoveredGroup.userCount}</span>
                </div>
            </div>
        )}
        {showSuccessModal && (
            <div className="modal-overlay-joingroup">
                <div className="modal-content-joingroup">
                    <h2>Successfully Joined the Group</h2>
                    <p>Would you like to go to the group page or stay on this page?</p>
                    <div className="modal-buttons-joingroup">
                        <button className="modal-button-joingroup" onClick={handleGoToGroup}>Go to Group Page</button>
                        <button className="modal-button-joingroup modal-cancel-button-joingroup" onClick={handleStay}>Stay on this Page</button>
                    </div>
                </div>
            </div>
        )}
    </div>
);
};

export default JoinGroup;