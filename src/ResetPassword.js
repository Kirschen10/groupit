import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './CSS/ForgotPassword.css'; // Import CSS file

const ResetPassword = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [passwordVerification, setPasswordVerification] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(5);

  const backgroundStyle = {
    backgroundImage: `url('/Images/BackgroundWithlogo.svg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh', // Set minimum height to cover the entire viewport
  };

  useEffect(() => {
    let timer;
    if (countdown > 0 && success) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      navigate('/'); // Redirect to login page or another page
    }
    return () => clearTimeout(timer);
  }, [countdown, success, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== passwordVerification) {
        setError('Passwords do not match');
    } else {
        setError('');
        fetch('http://localhost:8081/resetPassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => {
            if (response.ok) {
                setSuccess('Password reset successful.');
                console.log('Password reset successful');
            } else {
                return response.json().then(data => {
                    throw new Error(data.message || 'Failed to reset password');
                });
            }
        })
        .catch(err => {
            console.error('Error:', err);
            setError(err.message || 'An error occurred. Please try again.');
        });
    }
};

  return (
    <div style={backgroundStyle}>
      <div className="login-form-ForgotPassword">
        <div className="additional-options-ForgotPassword">
          <p style={{ fontFamily: "Calibri", fontSize: "15px" }}>Hello {username},</p>
        </div>
        <img src="\Images\lock.png" height={"80px"} alt="Lock Icon" className="iconLock" />
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="icon-container">
              <img src="\Images\padlock.png" height={"20px"} alt="Password Icon" className="icon" />
            </div>
            <input
              type="password"
              placeholder="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <div className="icon-container">
              <img src="\Images\padlock.png" height={"20px"} alt="Password Verification Icon" className="icon" />
            </div>
            <input
              type="password"
              placeholder="password Verification"
              value={passwordVerification}
              required
              onChange={(e) => setPasswordVerification(e.target.value)}
            />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && (
            <p className="success-message">
              {success}
              <br />
              Redirecting in {countdown} seconds...
            </p>
          )}
          <button type="submit">Reset Password</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
