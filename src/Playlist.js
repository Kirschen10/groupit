import React from 'react';
import './CSS/Playlist.css'; // Import CSS file

const Playlist = () => {
   // Temporary list of songs
   const songs = [
    { name: 'Song One', artist: 'Artist A' },
    { name: 'Song Two', artist: 'Artist B' },
    { name: 'Song Three', artist: 'Artist C' },
    { name: 'Song Four', artist: 'Artist D' },
    { name: 'Song Five', artist: 'Artist E' },
];

return (
    <div className="play-list-container">
        {songs.map((song, index) => (
            <div key={index} className="song-card">
                <div className="song-info">
                    <span className="song-name">{song.name}</span>
                    <span className="song-artist">{song.artist}</span>
                </div>
            </div>
        ))}
    </div>
);
};

export default Playlist;
