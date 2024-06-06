// ForgotPassword.js
import React from 'react';
import { useState } from 'react';
import { useNavigate  } from 'react-router-dom';
import './CSS/ForgotPassword.css'; // Import CSS file

function ForgotPassword() {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');

    const backgroundStyle = {
        backgroundImage: `url('/Images/BackgroundWithlogo.svg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh', // Set minimum height to cover the entire viewport
    };


    const handleBackLogIn = (e) => {
        e.preventDefault();
        navigate(`/`);
    };
    
  return (
    <div style={backgroundStyle}>
    <div className="login-form-ForgotPassword">
        <div className="additional-options-ForgotPassword">
            <span onClick={handleBackLogIn} style={{fontFamily: "Calibri", fontSize:"15px"}}>Back to Login</span>
        </div>
    <img src="\Images\lock.png" height={"80px"} alt="Lock Icon" className="iconLock" />
        <h2>Email Verification</h2>
               <form>
                   <div className="form-group">
                       <div className="icon-container">
                           <img src="\Images\profile.png" height={"20px"} alt="Username Icon" className="icon" />
                       </div>
                       <input
                           type="text"
                           placeholder="Username"
                           value={username}
                           required
                           onChange={(e) => setUsername(e.target.value)}
                       />
                   </div>
                   <div className="form-group">
                   <div className="icon-container">
                           <img src="\Images\mail.png" height={"20px"} alt="Mail Icon" className="icon" />
                       </div>
                       <input
                           type="email"
                           placeholder="Email"
                           value={email}
                           required
                           onChange={(e) => setEmail(e.target.value)}
                       />
                   </div>
                   <button type="submit">Reset Password</button>
               </form>
           </div>
   </div>
 );
};

export default ForgotPassword
