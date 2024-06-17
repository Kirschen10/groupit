import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/UserGroups.css'; // Import CSS file

const UserGroups = ({ userID }) => {
    const [groups, setGroups] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Initialize navigate

    useEffect(() => {
        const fetchUserGroups = async () => {
            try {
                const response = await fetch(`http://localhost:8081/user-groups/${userID}`);
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                const data = await response.json();
                console.log('Fetched user groups:', data); // Detailed logging
                setGroups(data);
            } catch (error) {
                console.error('Error fetching user groups:', error);
                setError('Error fetching user groups');
            }
        };

        fetchUserGroups();
    }, [userID]);

    const handleEditClick = (group) => {
        navigate('/GroupDetails', { state: { group } });
    };

    const getGroupInitials = (groupName) => {
        const words = groupName.split(' ');
        if (words.length > 1) {
            return words[0].charAt(0) + words[1].charAt(0);
        }
        return groupName.charAt(0);
    };


    return (
        <div className="group-list-container">
            {groups.length === 0 ? (
                <div>No groups found for this user.</div>
            ) : (
                groups.map((group, index) => (
                    <div key={index} className="group-card">
                        <div className="group-image">
                            <span>{getGroupInitials(group.groupName)}</span>
                        </div>
                        <div className="group-info">
                            <div className="group-name">{group.groupName}</div>
                            <div className="group-description">{group.groupDescription}</div>
                            <div className="group-details">Created at: {new Date(group.createdAt).toLocaleDateString()}</div>
                            <div className="group-details">Number of Users: {group.userCount}</div>
                            <button className="edit-button" onClick={() => handleEditClick(group)}>Go To Group</button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default UserGroups;
