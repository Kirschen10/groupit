import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import './CSS/Profile.css'; // Import CSS file
import Playlist from './Playlist';
import UserGroups from './UserGroups';

function Profile() {
    const navigate = useNavigate();
    const { user, logout } = useUser();
    const [userID , setUserID] = useState('');
    const [userData, setUserData] = useState(null);
    const [songs, setSongs] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        userName: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`http://localhost:8081/api/user-data/${user.username}`);
                const data = await response.json();

                if (response.ok) {
                    setUserData(data);
                    setFormData({
                        firstName: data.firstName,
                        lastName: data.lastName,
                        userName: data.userName,
                        email: data.email,
                        password: '' // Do not populate password field for security reasons
                    });
                    setUserID(data.userID)
                } else {
                    console.error('Error fetching user data:', data.message);
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
            }
        };

        if (user) {
            fetchUserData();
        }
    }, [user]);


    const handleHomePage = () => {
        navigate(`/HomePage`);
    };

    const handleQuestions = () => {
        navigate(`/Questions`);
    };

    const handleEdit = () => {
        navigate('/EditProfile')
    };

    const handleSignOut = () => {
        logout();
        navigate('/');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Perform any necessary validation here
        if (formData.userName !== userData.userName) {
            // Check if the username is unique
            const checkResponse = await fetch(`http://localhost:8081/api/check-username/${formData.userName}`);
            const checkData = await checkResponse.json();

            if (!checkResponse.ok) {
                setError('Username is already taken.');
                return;
            }
        }

        // Submit the updated data to the server
        const response = await fetch(`http://localhost:8081/api/update-user/${user.username}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            setEditMode(false);
            setUserData({
                ...userData,
                ...formData,
                password: undefined // Keep the password field secure
            });
        } else {
            const data = await response.json();
            setError(data.message || 'Error updating profile');
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="background-profile">
            <div>
                <span className="question-mark-button" onClick={handleQuestions}>
                    <img src="/Images/question.svg" alt="Question" />
                </span>
            </div>
            <span className="Home-page-button" onClick={handleHomePage}>
                <img src="/Images/Logo.svg" alt="Logo" />
            </span>
            <div className="info-container">
                {editMode ? (
                    <form onSubmit={handleSubmit}>
                        <h2> Edit Personal Information</h2>
                        <div className="info-content">
                            <div>
                                <p>
                                    <span className="label">First Name: </span>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                        />
                                </p>
                            </div>
                            <div>
                                <p>
                                    <span className="label">Last Name: </span>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                        />
                                </p>
                            </div>
                            <div>
                                <p>
                                    <span className="label">User Name: </span>
                                        <input
                                            type="text"
                                            name="userName"
                                            value={formData.userName}
                                            onChange={handleChange}
                                            required
                                        />
                                </p>
                            </div>
                            <div>
                                <p>
                                    <span className="label">Email: </span>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                </p>
                            </div>
                            <div>
                                <p>
                                    <span className="label">Password: </span>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                </p>
                            </div>
                        </div>
                        {error && <p className="error">{error}</p>}
                        <div className="buttons">
                            <button type="submit">Save</button>
                            <button type="button" onClick={() => setEditMode(false)}>Cancel</button>
                        </div>
                    </form>
                ) : (
                    <>
                        <h2>Personal Information</h2>
                        <div className="info-content">
                            <div>
                                <p>
                                    <span className="label">First Name: </span>
                                    {userData?.firstName || 'Loading...'}
                                </p>
                            </div>
                            <div>
                                <p>
                                    <span className="label">Last Name: </span>
                                    {userData?.lastName || 'Loading...'}
                                </p>
                            </div>
                            <div>
                                <p>
                                    <span className="label">User Name: </span>
                                    {userData?.userName || 'Loading...'}
                                </p>
                            </div>
                            <div>
                                <p>
                                    <span className="label">Email: </span>
                                    {userData?.email || 'Loading...'}
                                </p>
                            </div>
                            <div>
                                <p>
                                    <span className="label">Birthday: </span>
                                    {userData?.birthday ? formatDate(userData.birthday) : 'Loading...'}
                                </p>
                            </div>
                            <div>
                                <p>
                                    <span className="label">Password: </span>
                                    ********
                                </p>
                            </div>
                        </div>
                        <div className="buttons">
                            <button onClick={handleEdit}>
                                <img src="/Images/edit icon.svg" alt="Edit" /> Edit
                            </button>
                            <button onClick={handleSignOut}>
                                <img src="/Images/sign out icon.svg" alt="Sign Out" /> Sign Out
                            </button>
                        </div>
                    </>
                )}
            </div>
            <div className="content-container">
                <div className="content-box">
                    <h2>My Favorite Music</h2>
                    <Playlist userID={userID}/>
                </div>
                <div className="content-box">
                    <h2>My Group</h2>
                    <UserGroups userID={userID}/>
                </div>
            </div>
        </div>
    );
}

export default Profile;
