import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import Select from 'react-select';
import './CSS/SelectSongs.css'; // Import the new CSS file

function SelectSongs() {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedArtists, username } = location.state || { selectedArtists: [], username };
    const { login } = useUser();
    const [remember, setRemember] = useState(false);
    const [allSongs, setAllSongs] = useState([]);
    const [topSongs, setTopSongs] = useState([]);
    const [selectedSongs, setSelectedSongs] = useState([]);
    const [searchOptions, setSearchOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null); // New state for selected option

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const allSongsResponse = await fetch('http://localhost:8081/all-songs-by-artists', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ selectedArtists }),
                });

                const topSongsResponse = await fetch('http://localhost:8081/top-songs-by-artists', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ selectedArtists }),
                });

                const allSongsData = await allSongsResponse.json();
                const topSongsData = await topSongsResponse.json();

                const topSongIds = new Set(topSongsData.map(song => song.id));
                const filteredAllSongs = allSongsData.filter(song => !topSongIds.has(song.id));

                setAllSongs(filteredAllSongs);
                setTopSongs(topSongsData);
                setSearchOptions(filteredAllSongs.map(song => ({ value: song.id, label: `${song.name} - ${song.artistName}` })));
            } catch (error) {
                console.error('Error fetching songs:', error);
            }
        };

        fetchSongs();
    }, [selectedArtists]);

    const handleSelectSong = (song) => {
        // Add song to selected songs
        setSelectedSongs(prevSongs => [...prevSongs, song]);

        // Remove song from topSongs and allSongs
        setTopSongs(prevSongs => prevSongs.filter(s => s.id !== song.id));
        setAllSongs(prevSongs => prevSongs.filter(s => s.id !== song.id));

        // Remove song from search options
        setSearchOptions(prevOptions => prevOptions.filter(option => option.value !== song.id));

        // Reset selected option after adding a song
        setSelectedOption(null);
    };


    const handleRemoveSong = (song) => {
        setSelectedSongs(prevSongs => prevSongs.filter(s => s.id !== song.id));
        // Return the song back to the available songs and search options
        setAllSongs(prevSongs => [...prevSongs, song]);
        setTopSongs(prevSongs => [...prevSongs, song]);
        setSearchOptions(prevOptions => [
            ...prevOptions,
            { value: song.id, label: `${song.name} - ${song.artistName}` }
        ]);
    };

    const handleCompletion = async () => {
        const uniqueSongs = [...new Set(selectedSongs)];
        try {
            const response = await fetch('http://localhost:8081/add-user-songs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username, songIDs: uniqueSongs.map(song => song.id) }),
            });

            const data = await response.json();
            if (data.message === 'Songs added to user successfully') {
                login({ username }, remember); // Save user data in context
                navigate('/HomePage');
            } else {
                console.error('Error:', data.message);
            }
        } catch (error) {
            console.error('Error adding user songs:', error);
        }
    };


    return (
        <div className="background-homePage">
            <div className="page-header">
                <h1>Build your playlist!</h1>
                <h2>Select at least 10 songs from the list</h2>
            </div>
            <div className="songs-selection">
                <div className="songs-list">
                    <h2>Available Songs</h2>
                    <Select
                        value={selectedOption} // Controlled value of the select box
                        options={searchOptions}
                        onChange={(selectedOption) => {
                            // Ensure selectedOption is not null (i.e., the "x" button wasn't clicked)
                            if (selectedOption) {
                                const song = allSongs.find(s => s.id === selectedOption.value);
                                if (song) {
                                    handleSelectSong(song);
                                }
                            }
                        }}
                        placeholder="Search for a song"
                        className="react-select-songs"
                        classNamePrefix="react-select-songs"
                        isClearable
                    />
                    <div className="songs-list-scroll">
                        {topSongs.map(song => (
                            <div key={song.id} className="select-song-item" onClick={() => handleSelectSong(song)}>
                                <div className="song-name">{song.name}</div>
                                <div className="artist-name">{song.artistName}</div>
                            </div>
                        ))}
                    </div>

                </div>
                <div className="selected-songs">
                    <h2>Selected Songs</h2>
                    <div className="selected-songs-scroll">
                        {selectedSongs.map(song => (
                            <div key={song.id} className="select-song-item" onClick={() => handleRemoveSong(song)}>
                                <div className="song-name">{song.name}</div>
                                <div className="artist-name">{song.artistName}</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
            <div className="select_song_actions">
                    {selectedSongs.length >= 10 && (
                        <button className="select_song_finish_button" onClick={handleCompletion}>Let's Start!</button>
                    )}
                </div>

        </div>
    );
}

export default SelectSongs;
