import React, { useState, useEffect } from 'react';
import './CSS/Playlist.css'; // Import CSS file

const Playlist = ({ userID }) => {
    const [songs, setSongs] = useState([]);
    const [error, setError] = useState(null);

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
                setError('Error fetching playlist');
            }
        };

        fetchPlaylist();
    }, [userID]);

    return (
        <div className="play-list-container">
            { songs.length === 0 ? (
                <div>No Songs found for this user.</div>
            ) : (
                songs.map((song, index) => (
                    <div key={index} className="song-card">
                        <div className="song-info">
                            <span className="song-name">{song.name}</span>
                            <span className="song-artist">{song.artist}</span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Playlist;
