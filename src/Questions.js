import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import './CSS/Questions.css';

function Questions() {
    const navigate = useNavigate();
    const { user, logout } = useUser();
    const [activeIndex, setActiveIndex] = useState(null);

    const handleHomePage = () => {
        navigate(`/HomePage`);
    };

    const handleProfile = () => {
        navigate(`/Profile`);
    };

    const toggleAnswer = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const faqItems = [
        {
            question: "How does the recommendation system work?",
            answer: "Our system uses advanced algorithms to analyze your group’s preferences and generate song recommendations that are most likely to satisfy the entire group. The system also suggests groups of similar musical taste. We are always looking to better our performances, therefore we encourage you to add your feedback on each recommendation😊"
        },
        {
            question: "How do I create a group for my friends and I?",
            answer: "To create a group click on the \"Create Group\" button at Home page and fill in the required information, including name and a short description about your group."
        },
        {
            question: "How do I add friends to my group?",
            answer: "You have an option to add existing users to your group while creating the group or add them later on when entering the group’s page from your profile. Users can also add themselves to groups by clicking on the “Join Group” option in the Home Page and entering the group’s unique ID."
        },
        {
            question: "Where can I find the group’s unique ID?",
            answer: "The group’s unique ID appears in the group’s page. You can enter the pages of all groups you are part of from your Profile by clicking on the “Go to Group” button."
        },
        {
            question: "Can anyone join my group?",
            answer: "Yes, all groups in our system are public. Groupit’s policy is designed to foster the creation of a vibrant community where users can freely share their interests and expand their horizons. By allowing anyone to join, we aim to create a diverse and inclusive environment that encourages collaboration and sharing."
        },
        {
            question: "I forgot my password. What should I do?",
            answer: "Click on the \"Forgot Password?\" button on the Login page, enter your username and email address and an email with a reset option will be sent to your inbox."
        },
        {
            question: "How is my data protected?",
            answer: "We prioritize your privacy and data security. All data is encrypted and stored securely, advanced security measures are employed to ensure your data is protected at all times."
        },
        {
            question: "My musical taste changed since the time I signed up to the website. How can I change my song preferences?",
            answer: "You can change your preference list at all times by entering your Profile and editing the songs you chose."
        }
    ];

    return (
        <div className="background-profile">
            <div>
                <span className="profile-button" onClick={handleProfile}>
                    <img src="/Images/user.svg" alt="Profile" />
                </span>
            </div>
            <span className="Home-page-button" onClick={handleHomePage}>
                <img src="/Images/Logo.svg" alt="Logo" />
            </span>
            <h3 className="faq_h3">Frequently Asked Questions</h3>
            <div className="faq_faq-section">
                <p className="faq_p">Got a question? Get an answer! We have compiled a list of frequently asked questions to help you find quick answers about our group recommendation system. If you don’t find the information you’re looking for, please feel free to contact us at groupittechnion@gmail.com.</p>
                <div className="faq_faq-container">
                    {faqItems.map((item, index) => (
                        <div
                            key={index}
                            className={`faq_faq-card ${activeIndex === index ? 'faq_active' : ''}`}
                            onClick={() => toggleAnswer(index)}
                        >
                            <h4 className="faq_h4">{item.question}</h4>
                            {activeIndex === index && <p className="faq_p">{item.answer}</p>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Questions;
