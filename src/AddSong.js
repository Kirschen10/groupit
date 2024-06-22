import React, { useState, useEffect } from 'react';
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

    const handleArtistSelect = async (artistName) => {
        setSelectedArtist(artistName);
        setSearchError('');
        setSearchArtist(''); // Reset search field
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
        try {
            const response = await fetch(`http://localhost:8081/addSong/${userID}/${songID}`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error(`Error adding song: ${response.statusText}`);
            }
            onAddSong(); // Callback to refresh the playlist in the parent component
        } catch (error) {
            console.error('Error adding song:', error);
        }
    };

    const handleArtistSearch = async () => {
        if (searchArtist.trim().length >= 2) {
            try {
                const response = await fetch(`http://localhost:8081/searchArtist/${searchArtist}`);
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
    };

    const handleReturn = () => {
        setSelectedArtist(null);
        setSongs([]);
        setSearchSong('');
        setSelectedSong(null);
        setSearchResults([]);
    };

    const filteredSongs = songs.filter(song =>
        song.trackName.toLowerCase().includes(searchSong.toLowerCase())
    );

    return (
        <div className="add-song-container">
            <button onClick={onCancel} className="add-song-button">
                Back to playlist
            </button>
            <div className="add-song-content">
                {!selectedArtist ? (
                    <>
                        <div className="option-buttons">
                            <button
                                className={`option-button ${isSearching ? 'active' : ''}`}
                                onClick={() => { setIsSearching(true); setIsTopArtists(false); setSearchResults([]); }}
                            >
                                Search artist manually
                            </button>
                            <button
                                className={`option-button ${isTopArtists ? 'active' : ''}`}
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
                                    onChange={(e) => setSearchArtist(e.target.value)}
                                />
                                <button onClick={handleArtistSearch} className="search-button">Search</button>
                                {searchError && <div className="error-message">{searchError}</div>}
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
                ) : (
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
                        {selectedSong && (
                            <button className="add-button" onClick={() => handleAddSong(selectedSong)}>
                                Add
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddSong;
