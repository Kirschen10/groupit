import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation  } from 'react-router-dom';
import './CSS/SelectArtists.css';
import Grid from './Grid';
import ArtistSearch from './ArtistSearch';

function SelectArtists() {
    const navigate = useNavigate();
    const location = useLocation();
    const [artists, setArtists] = useState([]);
    const [extraArtists, setExtraArtists] = useState([]);
    const [error, setError] = useState('');
    const { username } = location.state || { username };

    const backgroundStyle = {
        backgroundImage: `url('/Images/Background_HomePage.svg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
    };

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
                } else {
                    setError('Unexpected response format for top artists');
                }
            })
            .catch(error => {
                console.error('Error fetching top artists:', error);
                setError('Failed to fetch top artists');
            });
    }, []);

    const [showSearch, setShowSearch] = useState(false);  // Controls the visibility of the search box
    const [selectedArtists, setSelectedArtists] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const artistsPerPage = 12;
    const currentArtists = artists.slice(currentPage * artistsPerPage, (currentPage + 1) * artistsPerPage);
    console.log("artists", artists);
    const handleSelectArtist = (selectedOption) => {
        const newArtist = { id: selectedOption.value, name: selectedOption.label };
        setArtists(prevArtists => [...prevArtists, newArtist]);
        setShowSearch(false);
    };

    useEffect(() => {
        console.log("Selected Artists: ", selectedArtists);
    }, [selectedArtists]);
    
    const handleClickPlus = () => {
        setShowSearch(true);
    }
    
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
            console.log("Searching for artist ID:", artistId); // Log the current artist ID being processed
            const results = artists.find(a => a.id === artistId);
            if (!results) {
                console.log("No artist found for ID:", artistId); // Log if no artist is found
            }
            return results ? { id: results.id, name: results.name } : null;
        }).filter(artist => artist !== null);  // Filter out any null entries
    
        console.log("Selected Artists Details:", selectedArtistsDetails); // Log the final array
        navigate('/selectSongs', { state: { selectedArtists: selectedArtistsDetails, username: username } }); // Pass username to the next page
    };
    
    return (
        <div style={backgroundStyle}>
            <div className="app">
                <h2>Select Your 5 Favorite Artists </h2>  
                {error && <div className="error">{error}</div>}       
            <Grid
                    Picker={currentArtists}
                    selectedCatalog={selectedArtists}
                    setSelectedCatalog={setSelectedArtists}
                    onCompletion={handleCompletion} 
                    limit = {5}   
                />
                <br />
               {showSearch && <ArtistSearch options={extraArtists.map(artist => ({ value: artist.id, label: artist.name }))} onSelect={handleSelectArtist} />}
            </div>
            <div className="pagination">
                    <button className="button-arrow" onClick={prevPage} disabled={currentPage === 0}>&#9664;</button>
                    <button className="button-arrow" onClick={handleClickPlus}>+</button>
                    <button className="button-arrow" onClick={nextPage} disabled={(currentPage + 1) * artistsPerPage >= artists.length}>&#9654;</button>
            </div>
            <div className="pagination">
                {selectedArtists.length === 5 && 
                            <button className="button-pagination-Lets-Continue" onClick={handleClickContinue}>Let's Continue!</button>}
            </div>
        </div>
    );
}

export default SelectArtists;
