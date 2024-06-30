import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import './CSS/EditProfile.css'; // Import CSS file

function EditProfile() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [userID, setUserID] = useState('');
    const [userData, setUserData] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        userName: '', // Keep userName in formData but don't make it editable
        email: '',
        password: '',
        birthday: ''
    });
    const [error, setError] = useState('');
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

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
                        userName: data.userName, // Set userName here
                        email: data.email,
                        password: '', // Do not populate password field for security reasons
                        birthday: data.birthday.split('T')[0] // Pre-fill birthday field
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

    useEffect(() => {
        if (error) {
            setShowErrorMessage(true);
            const timer = setTimeout(() => {
                setShowErrorMessage(false);
                setError('');
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        const handleClick = () => {
            setShowErrorMessage(false);
            setError('');
        };

        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleCancel = () => {
        navigate('/Profile');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const minDate = new Date('1900-01-01');
        const maxDate = new Date();
        const enteredDate = new Date(formData.birthday);

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (enteredDate < minDate || enteredDate > maxDate) {
            setError('Birthday must be between January 1st, 1900 and today.');
            return;
        }

        if (formData.password && !formData.password.match(passwordRegex)) {
            setError('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
            return;
        }


        if (formData.userName !== userData.userName) {
            const checkResponse = await fetch(`http://localhost:8081/api/check-username/${formData.userName}`);
            const checkData = await checkResponse.json();

            if (checkResponse.ok && checkData.exists) {
                setError('Username is already taken.');
                return;
            }
        }


        if (formData.email !== userData.email) {
            const checkResponse = await fetch(`http://localhost:8081/api/check-email/${formData.email}`);
            const checkData = await checkResponse.json();

            if (checkResponse.ok && checkData.exists) {
                setError('Email is already registered.');
                return;
            }
        }

        setShowConfirmation(true);
    };

    const handleConfirm = async () => {
        setShowConfirmation(false);

        try {
            const response = await fetch(`http://localhost:8081/api/update-user/${userID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                navigate('/Profile');
            } else {
                const data = await response.json();
                setError(data.message || 'Error updating profile');
            }
        } catch (err) {
            console.error('Error updating user:', err);
            setError('Error updating profile');
        }
    };

    const handleCancelConfirmation = () => {
        setShowConfirmation(false);
    };

    return (
        <div className="background-edit-profile">
            <div>
                <span className="question-mark-button-edit-profile" onClick={() => navigate(`/Questions`)}>
                    <img src="/Images/question.svg" alt="Question" />
                </span>
            </div>
            <span className="home-button-edit-profile" onClick={() => navigate(`/HomePage`)}>
                <img src="/Images/Logo.svg" alt="Logo" />
            </span>
            <div className="info-container-edit-profile">
                {error && <p className="error-message-edit-profile">{error}</p>}
                <h2>Edit Personal Information</h2>
                <form onSubmit={handleSubmit} className="edit-form">
                    <div className="info-content-edit-profile">
                        <div>
                            <label>First Name:</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Last Name:</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Email:</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Password:</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label>Birthday:</label>
                            <input
                                type="date"
                                name="birthday"
                                value={formData.birthday}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="buttons-edit-profile">
                        <button type="submit">Save</button>
                        <button type="button" onClick={handleCancel}>Cancel</button>
                    </div>
                </form>
            </div>
            {showConfirmation && (
                <div className="modal-overlay-edit-profile">
                    <div className="modal-content-edit-profile">
                        <h2>Confirm Changes</h2>
                        <p>Are you sure you want to save these changes?</p>
                        <div className="modal-buttons-edit-profile">
                            <button className="modal-button-edit-profile" onClick={handleConfirm}>Yes</button>
                            <button className="modal-button-edit-profile modal-cancel-button-edit-profile" onClick={handleCancelConfirmation}>No</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EditProfile;
