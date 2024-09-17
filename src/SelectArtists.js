import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CSS/SelectArtists.css';
import Grid from './Grid';
import Select from "react-select";

function SelectArtists() {
    const navigate = useNavigate();
    const location = useLocation();
    const [artists, setArtists] = useState([]);
    const [extraArtists, setExtraArtists] = useState([]);
    const [error, setError] = useState('');
    const [searchOptions, setSearchOptions] = useState([]); // Add a separate state for search options
    const { username } = location.state || { username };

    useEffect(() => {
        fetch('http://localhost:8081/top-artists')
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const top20 = data.slice(0, 20).map((artist, index) => ({
                        id: index + 1,
                        name: artist.artistName
                    }));
                    const next80 = data.slice(20).map((artist, index) => ({
                        id: index + 21,
                        name: artist.artistName
                    }));
                    setArtists(top20);
                    setExtraArtists(next80);
                    setSearchOptions(next80); // Initialize search options
                } else {
                    setError('Unexpected response format for top artists');
                }
            })
            .catch(error => {
                console.error('Error fetching top artists:', error);
                setError('Failed to fetch top artists');
            });
    }, []);

    const [showSearch, setShowSearch] = useState(false);
    const [selectedArtists, setSelectedArtists] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const artistsPerPage = 15;
    const currentArtists = artists.slice(currentPage * artistsPerPage, (currentPage + 1) * artistsPerPage);

    const handleSelectArtist = (selectedOption) => {
        if (selectedOption) {
            const newArtist = { id: selectedOption.value, name: selectedOption.label };
            setArtists(prevArtists => [...prevArtists, newArtist]);
            // Update search options to remove the selected artist
            setSearchOptions(prevOptions => prevOptions.filter(artist => artist.id !== selectedOption.value));
        }
        setShowSearch(false);
    };

    const handleClickPlus = () => {
        setShowSearch(prevShowSearch => !prevShowSearch);
    };

    const closeSearch = () => {
        setShowSearch(false);  // Close the search box
    };

    const nextPage = () => {
        if ((currentPage + 1) * artistsPerPage < artists.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleCompletion = () => {
        console.log("5 artists have been selected:", selectedArtists);
    };

    const handleClickContinue = () => {
        const selectedArtistsDetails = selectedArtists.map(artistId => {
            const results = artists.find(a => a.id === artistId);
            return results ? { id: results.id, name: results.name } : null;
        }).filter(artist => artist !== null);

        navigate('/selectSongs', { state: { selectedArtists: selectedArtistsDetails, username: username } });
    };

    return (
        <div className="background-homePage">
            <div className="app">
                <h2>Select Your 5 Favorite Artists</h2>
                {error && <div className="error">{error}</div>}
                <Grid
                    Picker={currentArtists}
                    selectedCatalog={selectedArtists}
                    setSelectedCatalog={setSelectedArtists}
                    onCompletion={handleCompletion}
                    limit={5}
                />
            </div>
            <div className="pagination">
                <span className="pagination-buttons" onClick={prevPage} style={{visibility: currentPage > 0 ? 'visible' : 'hidden'}}>
                    <img src="/Images/left arrow.svg" alt="Left Arrow" />
                </span>
                <span className="pagination-buttons" onClick={handleClickPlus}>
                    <img src="/Images/plus.svg" alt="Plus" />
                </span>
                <span className="pagination-buttons" onClick={nextPage} style={{visibility: (currentPage + 1) * artistsPerPage < artists.length ? 'visible' : 'hidden'}}>
                    <img src="/Images/right arrow.svg" alt="Right Arrow" />
                </span>
            </div>
            {showSearch &&
                <div className="artist-search-container">
                    <button className="close-button-SA" onClick={closeSearch}>x</button>
                    <Select
                        options={searchOptions.map(artist => ({ value: artist.id, label: artist.name }))}
                        onChange={handleSelectArtist}
                        placeholder="Search for an artist"
                        isClearable
                        className="react-select-artist"
                        classNamePrefix="react-select-artist"
                        styles={{
                            menuList: (provided) => ({
                                ...provided,
                                maxHeight: '120px',  // Assuming each row is 40px, so 3 rows = 120px
                                overflowY: 'auto',   // Enable scrolling when the options exceed the height
                            }),
                            menu: (provided) => ({
                                ...provided,
                                maxHeight: '120px',  // Limit the height of the dropdown itself
                            })
                        }}
                    />
                </div>
            }
            <div className="pagination">
                {selectedArtists.length === 5 &&
                <button className="button-pagination-Lets-Continue" onClick={handleClickContinue}>Let's Continue!</button>}
            </div>
        </div>
    );
}

export default SelectArtists;
