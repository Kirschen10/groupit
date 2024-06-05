import React, { useState, useEffect } from 'react';
import ArtistButton from './ArtistButton';

function ArtistsGrid({ artists, selectedArtists, setSelectedArtists, onCompletion }) {
    const [positions, setPositions] = useState({});

    useEffect(() => {
        const newPositions = {};
        const gridSize = Math.ceil(Math.sqrt(artists.length)); // Adjust grid size calculation if necessary
        artists.forEach((artist, index) => {
            const col = index % gridSize;
            const row = Math.floor(index / gridSize);
            newPositions[artist.id] = {
                left: `${(col + 0.5) * 100 / gridSize}%`,
                top: `${(row + 0.5) * 100 / gridSize}%`
            };
        });
        setPositions(newPositions);
    }, [artists]);

    const handleToggle = artistId => {
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
        if (selectedArtists.length === 5) {
            onCompletion();
        }
    }, [selectedArtists, onCompletion]);

    return (
        <div className="artists-grid">
            {artists.map(artist => (
                <ArtistButton
                    key={artist.id}
                    artist={artist}
                    onToggle={handleToggle}
                    isSelected={selectedArtists.includes(artist.id)}
                    style={positions[artist.id]}
                />
            ))}
        </div>
    );
}

export default ArtistsGrid;
