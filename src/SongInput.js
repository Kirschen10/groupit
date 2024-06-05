import React, { useState, useEffect } from 'react';
import './CSS/SongInput.css';
import ArtistsGrid from './ArtistsGrid';

function SongInput() {
    const artists = [
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
    ];

    const [selectedArtists, setSelectedArtists] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const artistsPerPage = 12;
    const currentArtists = artists.slice(currentPage * artistsPerPage, (currentPage + 1) * artistsPerPage);
 
    const handleToggle = (artistId) => {
        setSelectedArtists(prevSelected => {
            const isSelected = prevSelected.includes(artistId);
            if (isSelected) {
                return prevSelected.filter(id => id !== artistId);
            } else if (prevSelected.length < 5) {
                return [...prevSelected, artistId];
            }
            return prevSelected;
        });
    };

    useEffect(() => {
        console.log("Selected Artists: ", selectedArtists);
    }, [selectedArtists]);
    
    
    

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

    useEffect(() => {
        if (selectedArtists.length === 5) {
            handleCompletion();
        }
    }, [selectedArtists]); // Correctly react to changes in selectedArtists


    const handleCompletion = () => {
        console.log("5 artists have been selected:", selectedArtists);
    };

    const backgroundStyle = {
        backgroundImage: `url('/Images/Background_HomePage.svg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
    };

    return (
        <div style={backgroundStyle}>
            <div className="app">
                <h2>Select Your 5 Favorite Artists </h2>         
            <ArtistsGrid
                    artists={currentArtists}
                    selectedArtists={selectedArtists}
                    setSelectedArtists={setSelectedArtists}
                    onCompletion={handleCompletion}
                />
            </div>
            <div className="pagination">
                    <button className="button-arrow" onClick={prevPage} disabled={currentPage === 0}>&#9664;</button>
                    <button className="button-arrow" onClick={nextPage} disabled={(currentPage + 1) * artistsPerPage >= artists.length}>&#9654;</button>
            </div>
            <div className="pagination">
                {selectedArtists.length === 5 && 
                            <button className="button-pagination-Lets-Continue" >Let's Continue!</button>}
            </div>
        </div>
    );
}

export default SongInput;
