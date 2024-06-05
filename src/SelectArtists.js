import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/SelectArtists.css';
import Grid from './Grid';
import ArtistSearch from './ArtistSearch';

function SelectArtists() {
    const navigate = useNavigate();

    const backgroundStyle = {
        backgroundImage: `url('/Images/Background_HomePage.svg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
    };

    const extraArtists = [
        { id: 101, name: "Adele" },
        { id: 102, name: "Drake" },
        { id: 103, name: "Taylor Swift" },
        { id: 104, name: "The Weeknd" },
        { id: 105, name: "Billie Eilish" },
        { id: 106, name: "Ed Sheeran" },
        { id: 107, name: "Ariana Grande" },
        { id: 108, name: "Justin Bieber" },
        { id: 109, name: "BTS" },
        { id: 110, name: "Dua Lipa" },
        { id: 111, name: "Post Malone" },
        { id: 112, name: "SZA" },
        { id: 113, name: "Kendrick Lamar" },
        { id: 114, name: "Harry Styles" },
        { id: 115, name: "Lizzo" },
        { id: 116, name: "Tame Impala" },
        { id: 117, name: "Arctic Monkeys" },
        { id: 118, name: "Coldplay" },
        { id: 119, name: "Beyoncé" },
        { id: 120, name: "Lady Gaga" }
    ];    

    const [artists, setArtists] = useState([
        { id: 1, name: "Artist 1" },
        { id: 2, name: "Artist 2" },
        { id: 3, name: "Artist 3" },
        { id: 4, name: "Artist 4" },
        { id: 5, name: "Artist 5" },
        { id: 6, name: "Artist 6" },
        { id: 7, name: "Artist 7" },
        { id: 8, name: "Artist 8" },
        { id: 9, name: "Artist 9" },
        { id: 10, name: "Artist 10" },
        { id: 11, name: "Artist 11" },
        { id: 12, name: "Artist 12" },
        { id: 13, name: "Artist 13" },
    ]);
    const [showSearch, setShowSearch] = useState(false);  // Controls the visibility of the search box
    const [selectedArtists, setSelectedArtists] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const artistsPerPage = 12;
    const currentArtists = artists.slice(currentPage * artistsPerPage, (currentPage + 1) * artistsPerPage);

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
        navigate('/selectSongs', { state: { selectedArtists: selectedArtistsDetails } });
    };
    
    return (
        <div style={backgroundStyle}>
            <div className="app">
                <h2>Select Your 5 Favorite Artists </h2>         
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
