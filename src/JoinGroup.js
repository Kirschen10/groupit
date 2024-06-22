import React, { useState } from 'react';
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
    const [countdown, setCountdown] = useState(5);
    const navigate = useNavigate();

    const handleJoinGroupByID = async () => {
        try {
            const response = await axios.post('http://localhost:8081/join-group', { groupID, userName: user.username });
            setFeedbackMessage(response.data.message);
            if (response.data.message === 'Successfully joined the group') {
                setShowSuccessModal(true);
                startCountdown();
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setFeedbackMessage(error.response.data.message);
            } else {
                console.error('Error joining group:', error);
                setFeedbackMessage('Failed to join group');
            }
        }
    };

    const handleFindGroups = async () => {
        try {
            const response = await axios.get('http://localhost:8081/find-groups', {
                params: { username: user.username } // Pass the username as a query parameter
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
            setFeedbackMessage(response.data.message);
            if (response.data.message === 'Successfully joined the group') {
                setShowSuccessModal(true);
                startCountdown();
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setFeedbackMessage(error.response.data.message);
            } else {
                console.error('Error joining group:', error);
                setFeedbackMessage('Failed to join group');
            }
        }
    };

    const handleMouseEnter = (group) => {
        setHoveredGroup(group);
    };

    const handleMouseLeave = () => {
        setHoveredGroup(null);
    };

    const startCountdown = () => {
        const countdownInterval = setInterval(() => {
            setCountdown((prevCountdown) => {
                if (prevCountdown === 1) {
                    clearInterval(countdownInterval);
                    setShowSuccessModal(false);
                    navigate('/HomePage');
                }
                return prevCountdown - 1;
            });
        }, 1000);
    };

    const backgroundStyle = {
        backgroundImage: `url('/Images/Background_HomePage.svg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
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
        <div style={backgroundStyle}>
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
            <div className="join-group-container">
                <h2>Join Group</h2>
                <div className="join-group-top">
                    <h3 style={{textAlign:'left'}}>Join Group by Group ID:</h3>
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
                                <li key={group.groupID}>
                                    <div className="group-header">
                                        <span className="group-name">{group.groupName}<span className="group-id">(ID: {group.groupID})</span></span>
                                    </div>
                                    <div className="group-buttons">
                                        <span 
                                            className="info-button"
                                            onMouseEnter={() => handleMouseEnter(group)}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            Info
                                        </span>
                                        <button
                                            className="join-button-JoinGroup"
                                            onClick={() => handleJoinFoundGroup(group.groupID)}
                                        >
                                            Join Group
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    {feedbackMessage && <p className="feedback-message-JoinGroup">{feedbackMessage}</p>}
                </div>
            </div>
            {hoveredGroup && (
                <div className="group-details visible">
                    <h3>{hoveredGroup.groupName}</h3>
                    <p>{hoveredGroup.groupDescription}</p>
                    <div className="detail-item">
                        <span>ID:</span>
                        <span className="value">{hoveredGroup.groupID}</span>
                    </div>
                    <div className="detail-item">
                        <span>Created At:</span>
                        <span className="value">{new Date(hoveredGroup.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                        <span>Group Members:</span>
                        <span className="value">{hoveredGroup.userCount}</span>
                    </div>
                </div>
            )}
            {showSuccessModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Successfully Joined the Group</h2>
                        <p>{feedbackMessage}</p>
                        <p>Redirecting to the home page in <strong>{countdown}</strong> seconds.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JoinGroup;