import { useLocation } from 'react-router-dom';
import React, { useState } from 'react';
import './CSS/SelectArtists.css';
import Grid from './Grid';
import ArtistSearch from './ArtistSearch';

function SelectSongs() {
    const location = useLocation();
    console.log("Location State:", location.state); // Add this line to check the passed state
    const { selectedArtists } = location.state || { selectedArtists: [] };

    const backgroundStyle = {
        backgroundImage: `url('/Images/Background_HomePage.svg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
    };

    const extraSongs = [
        { id: 101, title: "Hello" },
        { id: 102, title: "God's Plan" },
        { id: 103, title: "Shake It Off" },
        { id: 104, title: "Blinding Lights" },
        { id: 105, title: "Bad Guy" },
        { id: 106, title: "Shape of You" },
        { id: 107, title: "7 rings" },
        { id: 108, title: "Peaches" },
        { id: 109, title: "Dynamite" },
        { id: 110, title: "Levitating" },
        { id: 111, title: "Circles" },
        { id: 112, title: "Good Days" },
        { id: 113, title: "HUMBLE." },
        { id: 114, title: "Watermelon Sugar" },
        { id: 115, title: "Juice" },
        { id: 116, title: "The Less I Know The Better" },
        { id: 117, title: "Do I Wanna Know?" },
        { id: 118, title: "Fix You" },
        { id: 119, title: "Single Ladies" },
        { id: 120, title: "Bad Romance" }
    ];
    
    const [songs, setSongs] = useState([
        { id: 1, name: "Song 1" },
        { id: 2, name: "Song 2" },
        { id: 3, name: "Song 3" },
        { id: 4, name: "Song 4" },
        { id: 5, name: "Song 5" },
        { id: 6, name: "Song 6" },
        { id: 7, name: "Song 7" },
        { id: 8, name: "Song 8" },
        { id: 9, name: "Song 9" },
        { id: 10, name: "Song 10" },
        { id: 11, name: "Song 11" },
        { id: 12, name: "Song 12" },
        { id: 13, name: "Song 13" },
    ]);

    const [showSearch, setShowSearch] = useState(false);  // Controls the visibility of the search box
    const [selectedSongs, setSelectedSongs] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const songsPerPage = 12;
    const currentArtists = songs.slice(currentPage * songsPerPage, (currentPage + 1) * songsPerPage);

    const handleSelectSong = (selectedOption) => {
        const newSong = { id: selectedOption.value, name: selectedOption.label };
        setSongs(prevSong => [...prevSong, newSong]);
        setShowSearch(false);
    };

    const handleClickPlus = () => {
        setShowSearch(true);
    }
    
    const nextPage = () => {
        if ((currentPage + 1) * songsPerPage < songs.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleCompletion = () => {
        console.log("10 song have been selected:", selectedSongs);
    };

    return (
        <div style={backgroundStyle}>
        <div className="app">
            <h2>Choose at least ten songs</h2>         
        <Grid
                Picker={currentArtists}
                selectedCatalog={selectedSongs}
                setSelectedCatalog={setSelectedSongs}
                onCompletion={handleCompletion} 
                limit = {10}   
            />
            <br />
           {showSearch && <ArtistSearch options={extraSongs.map(song => ({ value: song.id, label: song.title }))} onSelect={handleSelectSong} />}
        </div>
        <div className="pagination">
                <button className="button-arrow" onClick={prevPage} disabled={currentPage === 0}>&#9664;</button>
                <button className="button-arrow" onClick={handleClickPlus}>+</button>
                <button className="button-arrow" onClick={nextPage} disabled={(currentPage + 1) * songsPerPage >= songs.length}>&#9654;</button>
        </div>
        <div className="pagination">
            {selectedSongs.length === 10 && 
                        <button className="button-pagination-Lets-Continue" >Finish</button>}
        </div>
    </div>
    );
}

export default SelectSongs;

