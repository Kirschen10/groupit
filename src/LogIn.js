import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/LogIn.css'; // Import CSS file

const LogIn = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle login logic here, such as form validation and API call
        if (username && password) {
            // Mock login logic
            navigate(`/HomePage`);
        } else {
            alert('Please enter both username and password.');
        }
    };

    const handleRegistration = (e) => {
        e.preventDefault();
        navigate(`/Registration`);
    };

    const handleForgotPassword = (e) => {
        e.preventDefault();
        navigate(`/ForgotPassword`);
    };

    return (
        <div className="zoom-background-login">
            <div className="login-form">
                <form onSubmit={handleSubmit}>
                    <div className="form-group-login">
                        <div className="icon-container-login">
                            <img src="/Images/profile.png" height="20px" alt="Username Icon" className="icon-login" />
                        </div>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="input-login"
                        />
                    </div>
                    <div className="form-group-login">
                        <div className="icon-container-login">
                            <img src="/Images/padlock.png" height="20px" alt="Password Icon" className="icon-login" />
                        </div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-login"
                        />
                    </div>
                    <button type="submit" className="button-login" style={{ fontWeight: 'bold' }}>Login</button>
                </form>
                <div className="additional-options-login">
                    <span onClick={handleRegistration} style={{ fontFamily: 'Calibri', fontSize: '12px' }}>Create Account</span>
                    <span onClick={handleForgotPassword} style={{ fontFamily: 'Calibri', fontSize: '12px' }}>Forgot Password?</span>
                </div>
            </div>
        </div>
    );
};

export default LogIn;











// import React from 'react';
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './CSS/LogIn.css'; // Import CSS file
//
// const LogIn = () => {
//     const navigate = useNavigate();
//
//     const [username, setUsername] = useState('');
//     const [password, setPassword] = useState('');
//
//     const handleSubmit = (e) => {
//         e.preventDefault();
//         navigate(`/HomePage`);
//     };
//
//     const handleRegistration = (e) => {
//         e.preventDefault();
//         navigate(`/Registration`);
//     };
//
//     const handleForgotPassword = (e) => {
//         e.preventDefault();
//         navigate(`/ForgotPassword`);
//     };
//

//     return (
//         <div className="zoom-background-login">
//             <div className="login-form">
//                 <form onSubmit={handleSubmit}>
//                     <div className="form-group-login">
//                         <div className="icon-container-login">
//                             <img src="/Images/profile.png" height="20px" alt="Username Icon" className="icon-login" />
//                         </div>
//                         <input
//                             type="text"
//                             placeholder="Username"
//                             value={username}
//                             onChange={(e) => setUsername(e.target.value)}
//                         />
//                     </div>
//                     <div className="form-group-login">
//                         <div className="icon-container-login">
//                             <img src="/Images/padlock.png" height="20px" alt="Password Icon" className="icon-login" />
//                         </div>
//                         <input
//                             type="password"
//                             placeholder="Password"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                         />
//                     </div>
//                     <button type="submit" onClick={handleSubmit} style={{ fontWeight: 'bold' }}>Login</button>
//                 </form>
//                 <div className="additional-options-login">
//                     <span onClick={handleRegistration} style={{ fontFamily: 'Calibri', fontSize: '12px' }}>Create Account</span>
//                     <span onClick={handleForgotPassword} style={{ fontFamily: 'Calibri', fontSize: '12px' }}>Forgot Password?</span>
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// export default LogIn;
