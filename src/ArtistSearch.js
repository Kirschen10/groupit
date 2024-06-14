import React from 'react';
import Select from 'react-select';

const ArtistSearch = ({ options, onSelect }) => {
    const customStyles = {
        control: (provided) => ({
            ...provided,
            width: 300, // Adjust width as needed
            height: 50,
            border: '1px solid lightgray',
            borderRadius: '4px',
        }),
        menu: (provided) => ({
            ...provided,
            width: 300, // Match the width to the control
        }),
        menuList: (provided) => ({
            ...provided,
            maxHeight: '105px', // Set the maximum height for 3 options
            overflowY: 'auto', // Enable vertical scrolling
        })
    };

    const handleChange = (selectedOption) => {
        if (selectedOption) {
            onSelect(selectedOption); // Only call onSelect if selectedOption is not null
        } else {
            onSelect(null); // Handle clear or deletion case
        }
    };

    return (
        <Select
            options={options}
            onChange={handleChange}
            placeholder="Search for an artist..."
            isClearable={true}
            isSearchable={true}
            styles={customStyles}
        />
    );
};

export default ArtistSearch;
