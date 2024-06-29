import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './CSS/ResetPassword.css'; // Import CSS file

const ResetPassword = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [passwordVerification, setPasswordVerification] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

    useEffect(() => {
        if (feedbackMessage) {
            setShowErrorMessage(true);
            const timer = setTimeout(() => {
                setShowErrorMessage(false);
                setFeedbackMessage('');
            }, 5000);

            // Clear timeout if component is unmounted or message changes
            return () => clearTimeout(timer);
        }
    }, [feedbackMessage]);

    useEffect(() => {
        const handleClick = () => {
            setShowErrorMessage(false);
            setFeedbackMessage('');
        };

        // Add event listener for all button clicks
        document.addEventListener('click', handleClick);

        // Cleanup event listener on component unmount
        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, []);


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
            setShowErrorMessage(true);
            return;
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!password.match(passwordRegex) || !passwordVerification.match(passwordRegex)) {
            setError('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
            setShowErrorMessage(true)
            return;
        }

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
            setShowErrorMessage(true);
        });
    }

  return (
    <div className='background-ResetPassword'>
      <div className="ResetPassword-form">
        <img src="\Images\lock.png" height={"80px"} alt="Lock Icon" className="iconLock" />
        <h2 className='h2-ResetPassword'>{username}, Please Enter New Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group-ResetPassword">
            <div className="icon-container-ResetPassword">
              <img src="\Images\padlock.png" height={"20px"} alt="Password Icon" className="icon" />
            </div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="input-ResetPassword"
            />
          </div>
          <div className="form-group-ResetPassword">
            <div className="icon-container-ResetPassword">
              <img src="\Images\padlock.png" height={"20px"} alt="Password Verification Icon" className="icon" />
            </div>
            <input
              type="password"
              placeholder="Password Verification"
              value={passwordVerification}
              required
              onChange={(e) => setPasswordVerification(e.target.value)}
              className="input-ResetPassword"
            />
          </div>
          {error && <p className="error-message-ResetPassword">{error}</p>}
          {success && (
            <p className="success-message-ResetPassword">
              {success}
              <br />
              Redirecting in {countdown} seconds...
            </p>
          )}
          <button type="submit" className='button-ResetPassword'>Reset Password</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
