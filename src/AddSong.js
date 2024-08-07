import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import './CSS/AddSong.css';

const AddSong = ({ userID, onAddSong, onCancel }) => {
    const [artists, setArtists] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [songs, setSongs] = useState([]);
    const [searchArtist, setSearchArtist] = useState('');
    const [searchError, setSearchError] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isTopArtists, setIsTopArtists] = useState(false);
    const [searchSong, setSearchSong] = useState('');
    const [selectedSong, setSelectedSong] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isTopArtists) {
            const fetchArtists = async () => {
                try {
                    const response = await fetch('http://localhost:8081/top-artists');
                    if (!response.ok) {
                        throw new Error(`Error fetching top artists: ${response.statusText}`);
                    }
                    const data = await response.json();
                    setArtists(data);
                } catch (error) {
                    console.error('Error fetching top artists:', error);
                }
            };

            fetchArtists();
        }
    }, [isTopArtists]);

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    const handleArtistSelect = async (artistName) => {
        setSelectedArtist(artistName);
        setSearchError('');
        setSearchArtist(''); // Reset search field
        clearErrorMessage(); // Clear error message on new action
        try {
            const response = await fetch(`http://localhost:8081/songsBySinger/${artistName}`);
            if (!response.ok) {
                throw new Error(`Error fetching songs: ${response.statusText}`);
            }
            const data = await response.json();
            setSongs(data.songs);
        } catch (error) {
            console.error('Error fetching songs:', error);
        }
    };

    const handleAddSong = async (songID) => {
        clearErrorMessage(); // Clear error message on new action
        try {
            const response = await fetch(`http://localhost:8081/addSong/${userID}/${songID}`, {
                method: 'POST',
            });
            if (response.ok) {
                onAddSong(); // Refresh the playlist in the parent component
                setErrorMessage('');
            } else if (response.status === 409) {
                // Handle the case where the song is already in the playlist
                const result = await response.json(); // Get the response message
                setErrorMessage(result.message);
            } else {
                throw new Error('Failed to add song');
            }
        } catch (error) {
            console.error('Error adding song:', error);
            alert('An error occurred while adding the song.');
        }
    };

    const handleArtistSearch = useCallback(debounce(async (query) => {
        clearErrorMessage();
        setLoading(true);
        if (query.trim().length >= 2) {
            try {
                const response = await fetch(`http://localhost:8081/searchArtist/${query}`);
                if (!response.ok) {
                    throw new Error(`Error searching for artist: ${response.statusText}`);
                }
                const data = await response.json();
                if (data.artists.length > 0) {
                    setSearchResults(data.artists);
                    setSearchError('');
                } else {
                    setSearchError('No artist found');
                    setSearchResults([]);
                }
            } catch (error) {
                console.error('Error searching for artist:', error);
                setSearchError('An error occurred while searching');
                setSearchResults([]);
            }
        } else {
            setSearchError('Please enter at least 2 characters');
            setSearchResults([]);
        }
        setLoading(false); // End loading
    }, 300), []);

    const handleSearchInputChange = (e) => {
        setSearchArtist(e.target.value);
        handleArtistSearch(e.target.value);
    };

    const handleReturn = () => {
        clearErrorMessage();
        setSelectedArtist(null);
        setSongs([]);
        setSearchSong('');
        setSelectedSong(null);
        setSearchResults([]);
    };

    const clearErrorMessage = () => {
        setErrorMessage('');
    };

    const filteredSongs = songs.filter(song =>
        song.trackName.toLowerCase().includes(searchSong.toLowerCase())
    );

    return (
        <div className="add-song-container">
            <div className="add-song-content">
                {loading && (
                    <div className="loading-container">
                        <div className="loading-dots">...</div>
                    </div>
                )}
                {!selectedArtist && (
                    <>
                        <div className="option-buttons-AddSong">
                            <button
                                className={`option-button-AddSong ${isSearching ? 'active' : ''}`}
                                onClick={() => { setIsSearching(true); setIsTopArtists(false); setSearchResults([]); }}
                            >
                                Search artist manually
                            </button>
                            <button
                                className={`option-button-AddSong ${isTopArtists ? 'active' : ''}`}
                                onClick={() => { setIsTopArtists(true); setIsSearching(false); setSearchResults([]); }}
                            >
                                Choosing an artist from Top 100 list
                            </button>
                        </div>
                        {isSearching && (
                            <div className="search-artist">
                                <input
                                    type="text"
                                    placeholder="Enter artist name..."
                                    value={searchArtist}
                                    onChange={handleSearchInputChange}
                                />
                                {searchError === 'Please enter at least 2 characters' && (
                                    <div className="search-error">{searchError}</div>
                                )}
                                {searchError === 'No artist found' && (
                                    <div className="no-artist-found">
                                        {searchError}
                                        <img src="/Images/not fount.svg" alt="Sad Smiley" />
                                    </div>
                                )}
                            </div>
                        )}
                        {isTopArtists && (
                            <div className="artist-list">
                                {artists.map((artist, index) => (
                                    <div
                                        key={index}
                                        className={`artist-item ${selectedArtist === artist.artistName ? 'selected' : ''}`}
                                        onClick={() => handleArtistSelect(artist.artistName)}
                                    >
                                        {artist.artistName}
                                    </div>
                                ))}
                            </div>
                        )}
                        {searchResults.length > 0 && (
                            <div className="artist-list">
                                {searchResults.map((artist, index) => (
                                    <div
                                        key={index}
                                        className={`artist-item ${selectedArtist === artist.artistName ? 'selected' : ''}`}
                                        onClick={() => handleArtistSelect(artist.artistName)}
                                    >
                                        {artist.artistName}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
                {selectedArtist && !loading && (
                    <div className="songs-section">
                        <h3>The songs of {selectedArtist}</h3>
                        <div className="song-search-container">
                            <input
                                type="text"
                                placeholder="Search for a song..."
                                value={searchSong}
                                onChange={(e) => setSearchSong(e.target.value)}
                            />
                            <button onClick={handleReturn} className="return-button">
                                Return to choose a singer
                            </button>
                        </div>
                        <div className="song-list">
                            {filteredSongs.map((song) => (
                                <div
                                    key={song.trackId}
                                    className={`song-item ${selectedSong === song.trackId ? 'selected' : ''}`}
                                    onClick={() => setSelectedSong(song.trackId)}
                                >
                                    {song.trackName}
                                </div>
                            ))}
                        </div>
                        {errorMessage && <div className="error-message">{errorMessage}</div>}
                        {selectedSong && (
                            <button className="add-button" onClick={() => handleAddSong(selectedSong)}>
                                Add
                            </button>
                        )}
                    </div>
                )}
            </div>
            <button onClick={onCancel} className="add-song-button">
                Back to playlist
            </button>
        </div>
    );
};

export default AddSong;
