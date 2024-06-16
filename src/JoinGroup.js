import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CSS/JoinGroup.css'; // Ensure you create and style this CSS file

const JoinGroup = () => {
    const [groupID, setGroupID] = useState('');
    const [foundGroups, setFoundGroups] = useState([]);
    const [showGroups, setShowGroups] = useState(false); // New state variable
    const navigate = useNavigate();

    const handleJoinGroupByID = async () => {
        try {
            const response = await axios.post('http://localhost:8081/api/join-group', { groupID });
            if (response.data.exists) {
                alert('Successfully joined the group!');
                navigate('/HomePage');
            } else {
                alert('Group ID does not exist.');
            }
        } catch (error) {
            console.error('Error joining group:', error);
            alert('Failed to join group');
        }
    };

    const handleFindGroups = async () => {
        try {
            const response = await axios.get('http://localhost:8081/api/find-groups');
            setFoundGroups(response.data.groups);
            setShowGroups(true); // Show groups after fetching
        } catch (error) {
            console.error('Error finding groups:', error);
            alert('Failed to find groups');
        }
    };

    const handleJoinFoundGroup = async (groupID) => {
        try {
            const response = await axios.post('http://localhost:8081/api/join-group', { groupID });
            if (response.data.exists) {
                alert('Successfully joined the group!');
                navigate('/HomePage');
            } else {
                alert('Group ID does not exist.');
            }
        } catch (error) {
            console.error('Error joining group:', error);
            alert('Failed to join group');
        }
    };

    const backgroundStyle = {
        backgroundImage: `url('/Images/Background_HomePage.svg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh', // Set minimum height to cover the entire viewport
    };


    return (
    <div  style={backgroundStyle}>
        <div className="join-group-container">
            <h2>Join Group</h2>
            <div className="join-group-top">
                <h3>Join Group by Group ID:</h3>
                <input
                    type="text"
                    value={groupID}
                    onChange={(e) => setGroupID(e.target.value)}
                />
                <button className={"button-JoinGroup"} onClick={handleJoinGroupByID}>Join Group</button>
            </div>
            <div className="explore-groups-bottom">
                <h3>Explore Groups with Similar Taste</h3>
                <button onClick={handleFindGroups}>Find Groups</button>
                {showGroups && foundGroups.length > 0 && (
                    <ul>
                        {foundGroups.map((group) => (
                            <li key={group.groupID}>
                                {group.groupName} (ID: {group.groupID})
                                <button onClick={() => handleJoinFoundGroup(group.groupID)}>Join</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    </div>

    );
};

export default JoinGroup;
