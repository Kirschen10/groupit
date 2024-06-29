import React, { useState, useEffect } from 'react';
import './CSS/Playlist.css';
import AddSong from './AddSong';

const Playlist = ({ userID }) => {
    const [songs, setSongs] = useState([]);
    const [showAddSong, setShowAddSong] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [trackIDToDelete, setTrackIDToDelete] = useState(null);
    const [showTrashCan, setShowTrashCan] = useState(null); // Initialize the showTrashCan state here

    useEffect(() => {
        fetchPlaylist();
    }, [userID]);

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

    const handleDeleteOptions = (id) => {
        setShowModal(true);
        setTrackIDToDelete(id);
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:8081/deleteSong/${userID}/${trackIDToDelete}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`Error deleting song: ${response.statusText}`);
            }
            setSongs(songs.filter(song => song.trackId !== trackIDToDelete));
            setShowModal(false);
        } catch (error) {
            console.error('Error deleting song:', error);
        }
    };

    const cancelLeaveGroup = () => {
        setShowModal(false);
        setTrackIDToDelete(null);
    };

    return (
        <div className="play-list-container">
            {showAddSong ? (
                <AddSong onAddSong={() => { 
                    fetchPlaylist(); 
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
                                onMouseEnter={() => setShowTrashCan(index)} // Set showTrashCan on mouse enter
                                onMouseLeave={() => setShowTrashCan(null)} // Reset showTrashCan on mouse leave
                            >
                                <div className="song-info">
                                    <span className="song-name">{song.name}</span>
                                    <span className="song-artist">{song.artist}</span>
                                </div>
                                {showTrashCan === index && (
                                    <img
                                        src="/Images/trash.png"
                                        alt="Delete"
                                        className="trash-can-icon"
                                        onClick={() => handleDeleteOptions(song.trackId)}
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
            {showModal && (
                <div className="modal-overlay-Playlist">
                    <div className="modal-content-Playlist">
                        <h2 className='modal-overlay-Playlist-h2'>Confirm Delete Song</h2>
                        <p>Are you sure you want to delete this song? <br /> This action cannot be undone.</p>
                        <div className="modal-buttons-Playlist">
                            <button className="modal-button-Playlist modal-cancel-button-Playlist" onClick={cancelLeaveGroup}>Cancel</button>
                            <button className="modal-button-Playlist" onClick={handleDelete}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Playlist;