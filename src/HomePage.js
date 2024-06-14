import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/HomePage.css'; // Import CSS file

function HomePage() {
    const navigate = useNavigate();

    // const backgroundStyleHomePage = {
    //     backgroundImage: `url('/Images/BackgroundWithlogo.svg')`,
    //     backgroundSize: 'cover',
    //     backgroundPosition: 'center',
    //     minHeight: '100vh',
    //     width: '100%',  // Ensure it covers full width
    // };

    const handleProfile = () => {
        navigate(`/Profile`);
    };

    const handleQuestions = () => {
        navigate(`/Questions`);
    };

    const handleCreateGroup = () => {
        navigate('/CreateGroup');
    };

    const handleJoinGroup = () => {
        navigate('/JoinGroup');
    };

    return (
        // <div style={backgroundStyleHomePage}>
        <div className="zoom-background-homePage">
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
            <h1 className="headline">What do you<br />wanna do today?</h1>
            <div className="button-container">
                <button className="create-group-button" onClick={handleCreateGroup}>
                    <img src="/Images/Create Group Button.svg" alt="Create Group" />
                </button>
                <button className="join-group-button" onClick={handleJoinGroup}>
                    <img src="/Images/Join Group Button.svg" alt="Join Group" />
                </button>
            </div>
        </div>
    );
}

export default HomePage;
