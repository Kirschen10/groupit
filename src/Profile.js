import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import Playlist from './Playlist';
import UserGroups from './UserGroups';
import './CSS/Profile.css';

function Profile() {
    const navigate = useNavigate();
    const { user, logout, updateUser } = useUser();
    const [userID, setUserID] = useState('');
    const [userData, setUserData] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        birthday: user.birthday
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
                        email: data.email,
                        password: data.password, // Don't populate password field for security
                        birthday: Date(data.birthday) ? new Date(data.birthday).toISOString().split('T')[0] : ''
                    });
                    setUserID(data.userID);
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
        setEditMode(true);
    };

    const handleSignOut = () => {
        logout();
        navigate('/');
    };

    const handleCancel = () => {
        setEditMode(false);
        // Reset formData to original user data on cancel
        setFormData({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: '', // Don't populate password field for security
            birthday: userData.birthday ? new Date(userData.birthday).toISOString().split('T')[0] : ''
        });
        setError('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'email') {
            // Email validation
            const isValidEmail = validateEmail(value);
            if (!isValidEmail) {
                setError('Invalid email address');
            } else {
                setError('');
            }
        }

        if (name === 'password') {
            // Password validation
            const isValidPassword = validatePassword(value);
            if (!isValidPassword) {
                setError('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character');
            } else {
                setError('');
            }
        }

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const validatePassword = (password) => {
        const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return re.test(String(password));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const today = new Date();
        const minDate = new Date('1900-01-01');

        const birthdayDate = new Date(formData.birthday);
        if (birthdayDate < minDate) {
            setError('Birthday cannot be before January 1st, 1900.');
            return;
        }
        if (birthdayDate > today) {
            setError('Birthday cannot be in the future.');
            return;
        }

        // Check if email already exists
        try {
            const response = await fetch(`http://localhost:8081/api/check-email/${formData.email}`);
            const data = await response.json();

            if (response.ok) {
                if (!data.available) {
                    setError('Email already in use. Please choose a different email');
                    return;
                }
            } else {
                console.error('Error checking email availability:', data.message);
                setError('Error checking email availability. Please try again');
                return;
            }
        } catch (err) {
            console.error('Error checking email availability:', err);
            setError('Failed to check email availability. Please try again');
            return;
        }

        // Prepare updated data
        const updatedData = {};
        updatedData['userID'] = userData.userID
        Object.keys(formData).forEach(key => {
            if (formData[key] !== userData[key]) {
                updatedData[key] = formData[key];
            }
        });

        // Update user data
        try {
            const response = await fetch(`http://localhost:8081/api/update-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                setEditMode(false);
                setUserData({
                    ...userData,
                    ...updatedData,
                    password: undefined // Securely update user data
                });
                updateUser({ ...user, ...updatedData });

                navigate(`/Profile`);

            } else {
                const data = await response.json();
                setError(data.message || 'Error updating profile');
            }
        } catch (err) {
            console.error('Error updating user data:', err);
            setError('Failed to update profile. Please try again');
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
            {editMode ? (
                <form onSubmit={handleSubmit} className="info-container-edit">
                    <h2>Edit Personal Information</h2>
                    <div className="info-content-edit">
                        <div>
                            <p>
                                <span className="label">First Name:</span>
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
                                <span className="label">Last Name:</span>
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
                                <span className="label">Email:</span>
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
                                <span className="label">Birthday:</span>
                                <input
                                    type="date"
                                    name="birthday"
                                    value={formData.birthday}
                                    onChange={handleChange}
                                />
                            </p>
                        </div>
                        <div>
                            <p>
                                <span className="label">Password:</span>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </p>
                        </div>
                        {error && <p className="error">{error}</p>}
                    </div>
                    <div className="buttons">
                        <button type="submit">Save</button>
                        <button type="button" onClick={handleCancel}>Cancel</button>
                    </div>
                </form>
            ) : (
                <div className="info-container">
                    <h2>Personal Information</h2>
                    <div className="info-content">
                        <div>
                            <p>
                                <span className="label">First Name:</span>
                                {userData?.firstName || 'Loading...'}
                            </p>
                        </div>
                        <div>
                            <p>
                                <span className="label">Last Name:</span>
                                {userData?.lastName || 'Loading...'}
                            </p>
                        </div>
                        <div>
                            <p>
                                <span className="label">User Name:</span>
                                {userData?.userName || 'Loading...'}
                            </p>
                        </div>
                        <div>
                            <p>
                                <span className="label">Email:</span>
                                {userData?.email || 'Loading...'}
                            </p>
                        </div>
                        <div>
                            <p>
                                <span className="label">Birthday:</span>
                                {userData?.birthday ? formatDate(userData.birthday) : 'Loading...'}
                            </p>
                        </div>
                        <div>
                            <p>
                                <span className="label">Password:</span>
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
                </div>
            )}
            <div className="content-container">
                <div className="content-box">
                    <h2>My Favorite Music</h2>
                    <Playlist userID={userID} />
                </div>
                <div className="content-box">
                    <h2>My Group</h2>
                    <UserGroups userID={userID} />
                </div>
            </div>
        </div>
    );
}

export default Profile;
