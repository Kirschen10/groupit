import React from 'react';

function ArtistButton({ artist: { id, name }, onToggle, isSelected, style }) {
  const buttonStyle = isSelected ? "selected" : "not-selected";

  function handleClick() {
    onToggle(id);
  }

  return (
    <button
      className={`artist-button ${buttonStyle}`}
      onClick={handleClick}
      style={style}
      aria-pressed={isSelected} // Accessibility improvement
    >
      {name}
    </button>
  );
}

export default React.memo(ArtistButton); // Optional performance improvement
