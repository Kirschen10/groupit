import React from 'react';
import { useNavigate  } from 'react-router-dom';
import './CSS/HomePage.css'; // Import CSS file
import Playlist from './Playlist';

function HomePage() {
    const navigate = useNavigate();

    const backgroundStyle = {
        backgroundImage: `url('/Images/Background_HomePage.svg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh', // Set minimum height to cover the entire viewport
    };

    const handleHomePage = (e) => {
      navigate(`/HomePage`);
  };

    return (
      <div style={backgroundStyle}>  
        <div>
            <span className="logo-button" onClick={handleHomePage}><img src="\Images\Logo.svg" alt='Logo'/></span>
        </div>
        <Playlist />
      </div>
    )
  }

export default HomePage
