import React, { useState, useEffect } from 'react';
import './CSS/Playlist.css'; // Import CSS file
import AddSong from './AddSong'; // Import AddSong component

const Playlist = ({ userID }) => {
    const [songs, setSongs] = useState([]);
    const [showTrashCan, setShowTrashCan] = useState(null);
    const [showAddSong, setShowAddSong] = useState(false); // State to toggle AddSong component

    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                const response = await fetch(`http://localhost:8081/userPlaylist/${userID}`);
                if (!response.ok) {
                    throw new Error(`Error fetching playlist: ${response.statusText}`);
                }
                const data = await response.json();
                setSongs(data.songs);
            } catch (error) {
                console.error('Error fetching playlist:', error);
            }
        };

        fetchPlaylist();
    }, [userID]);

    const handleDelete = async (trackId) => {
        try {
            const response = await fetch(`http://localhost:8081/deleteSong/${userID}/${trackId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`Error deleting song: ${response.statusText}`);
            }
            setSongs(songs.filter(song => song.trackId !== trackId));
        } catch (error) {
            console.error('Error deleting song:', error);
        }
    };

    const refreshPlaylist = async () => {
        try {
            const response = await fetch(`http://localhost:8081/userPlaylist/${userID}`);
            if (!response.ok) {
                throw new Error(`Error fetching playlist: ${response.statusText}`);
            }
            const data = await response.json();
            setSongs(data.songs);
        } catch (error) {
            console.error('Error fetching playlist:', error);
        }
    };

    return (
        <div className="play-list-container">
            {showAddSong ? (
                <AddSong onAddSong={() => { 
                    refreshPlaylist(); 
                    setShowAddSong(false); 
                }} 
                onCancel={() => setShowAddSong(false)}
                userID={userID} />
            ) : (
                <>
                    {songs.length === 0 ? (
                        <div>No Songs found for this user.</div>
                    ) : (
                        songs.map((song, index) => (
                            <div
                                key={index}
                                className="song-card"
                                onMouseEnter={() => setShowTrashCan(index)}
                                onMouseLeave={() => setShowTrashCan(null)}
                            >
                                <div className="song-info">
                                    <span className="song-name">{song.name}</span>
                                    <span className="song-artist">{song.artist}</span>
                                </div>
                                {showTrashCan === index && (
                                    <img
                                        src="/Images/trash.png" // Replace with your trash can icon URL
                                        alt="Delete"
                                        className="trash-can-icon"
                                        onClick={() => handleDelete(song.trackId)}
                                    />
                                )}
                            </div>
                        ))
                    )}
                    <button onClick={() => setShowAddSong(true)} className="add-song-button">
                        Add a Song
                    </button>
                </>
            )}
        </div>
    );
};

export default Playlist;
