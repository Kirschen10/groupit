    import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import './CSS/SelectSongs.css'; // Import the new CSS file

function SelectSongs() {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedArtists, username } = location.state || { selectedArtists: [], username };

    const [allSongs, setAllSongs] = useState([]);
    const [topSongs, setTopSongs] = useState([]);
    const [selectedSongs, setSelectedSongs] = useState([]);
    const [searchOptions, setSearchOptions] = useState([]);

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
        setSelectedSongs(prevSongs => [...prevSongs, song]);
        setTopSongs(prevSongs => prevSongs.filter(s => s.id !== song.id));
    };

    const handleRemoveSong = (song) => {
        setSelectedSongs(prevSongs => prevSongs.filter(s => s.id !== song.id));
        setTopSongs(prevSongs => [...prevSongs, song]);
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
                navigate('/profile');
            } else {
                console.error('Error:', data.message);
            }
        } catch (error) {
            console.error('Error adding user songs:', error);
        }
    };

    const customStyles = {
        menu: (provided) => ({
            ...provided,
            zIndex: 9999,
        }),
    };

    return (
        <div className="select-songs-container">
            <header className="page-header">
                <h1>Build your playlist!</h1>
                <p>Select at least 10 songs from the list</p>
            </header>
            <div className="songs-selection">
                <div className="songs-list">
                    <h2>Available Songs</h2>
                    <div className="songs-scroll">
                        {topSongs.map(song => (
                            <div key={song.id} className="song-item" onClick={() => handleSelectSong(song)}>
                                <div className="song-name">{song.name}</div>
                                <div className="artist-name">{song.artistName}</div>
                            </div>
                        ))}
                        <div className="song-item search-box-item">
                            <Select
                                options={searchOptions}
                                onChange={(selectedOption) => {
                                    const song = allSongs.find(s => s.id === selectedOption.value);
                                    if (song) {
                                        handleSelectSong(song);
                                    }
                                }}
                                placeholder="Search for a song"
                                className="search-select"
                                styles={customStyles}
                            />
                        </div>
                    </div>
                </div>
                <div className="selected-songs">
                    <h2>Selected Songs</h2>
                    <div className="songs-scroll">
                        {selectedSongs.map(song => (
                            <div key={song.id} className="song-item selected" onClick={() => handleRemoveSong(song)}>
                                <div className="song-name">{song.name}</div>
                                <div className="artist-name">{song.artistName}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="actions">
                {selectedSongs.length >= 10 && (
                    <button className="button" onClick={handleCompletion}>Finish</button>
                )}
            </div>
        </div>
    );
}

export default SelectSongs;
