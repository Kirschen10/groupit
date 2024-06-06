import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LogIn from "./LogIn";
import HomePage from './HomePage';
import Registration from './Registration';
import ForgotPassword from './ForgotPassword';
import SelectArtists from './SelectArtists';
import SelectSongs from './SelectSongs';
import ResetPassword from './ResetPassword';
import CheckMail from './CheckMail';
import { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check session status on mount
    fetch('http://localhost:8081/session', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      });
  }, []);

  const PrivateRoute = ({ element }) => {
    return user ? element : <Navigate to="/" />;
  };

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LogIn setUser={setUser} />} />
          <Route path="/HomePage" element={<PrivateRoute element={<HomePage user={user} />} />} />
          <Route path="/Registration" element={<Registration />} />
          <Route path="/ForgotPassword" element={<ForgotPassword />} />
          <Route path="/SelectArtists" element={<PrivateRoute element={<SelectArtists />} />} />
          <Route path="/SelectSongs" element={<PrivateRoute element={<SelectSongs />} />} />
          <Route path="/ResetPassword/:username" element={<ResetPassword />} />
          <Route path="/checkMail" element={<CheckMail />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
