import React, { useState, useEffect } from 'react';
import PickerButton from './PickerButton';

function Grid({ Picker, selectedCatalog, setSelectedCatalog, onCompletion, limit }) {
    const [positions, setPositions] = useState({});

    useEffect(() => {
        const newPositions = {};
        const gridSize = Math.ceil(Math.sqrt(Picker.length)); // Adjust grid size calculation if necessary
        Picker.forEach((artist, index) => {
            const col = index % gridSize;
            const row = Math.floor(index / gridSize);
            newPositions[artist.id] = {
                left: `${(col + 0.5) * 100 / gridSize}%`,
                top: `${(row + 0.5) * 100 / gridSize}%`
            };
        });
        setPositions(newPositions);
    }, [Picker]);

    const handleToggle = artistId => {
        setSelectedCatalog(prevSelected => {
            const isSelected = prevSelected.includes(artistId);
            if (isSelected) {
                return prevSelected.filter(id => id !== artistId);
            } else if (prevSelected.length < limit) {
                return [...prevSelected, artistId];
            }
            return prevSelected;
        });
    };

    useEffect(() => {
        if (selectedCatalog.length === limit) {
            onCompletion();
        }
    }, [selectedCatalog, onCompletion]);

    return (
        <div className="Picker-grid">
            {Picker.map(Picker => (
                <PickerButton
                    key={Picker.id}
                    artist={Picker}
                    onToggle={handleToggle}
                    isSelected={selectedCatalog.includes(Picker.id)}
                    style={positions[Picker.id]}
                />
            ))}
        </div>
    );
}

export default Grid;
