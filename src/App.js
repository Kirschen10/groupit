import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from 'react';
import LogIn from "./LogIn";
import HomePage from './HomePage';
import Registration from './Registration';
import ForgotPassword from './ForgotPassword';
import Profile from './Profile';
import SelectArtists from './SelectArtists';
import SelectSongs from './SelectSongs';
import ResetPassword from './ResetPassword';
import CheckMail from './CheckMail';
import GroupDetails from './GroupDetails';
import CreateGroup from './CreateGroup';
import JoinGroup from './JoinGroup';
import PrivateRoute from './PrivateRoute';
import Questions from './Questions';


function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LogIn />} />
          <Route path="/Registration" element={<Registration />} />
          <Route path="/ForgotPassword" element={<ForgotPassword />} />
          <Route path="/SelectArtists" element={<SelectArtists />} />
          <Route path="/SelectSongs" element={<SelectSongs />} />
          <Route path="/Questions" element={<Questions />} />
          <Route element={<PrivateRoute />}>
            <Route path="/HomePage" element={<HomePage />} />
            <Route path="/ResetPassword/:username" element={<ResetPassword />} />
            <Route path="/CheckMail" element={<CheckMail />} />
            <Route path="/Profile" element={<Profile />} />
            <Route path="/CreateGroup" element={<CreateGroup />} />
            <Route path="/JoinGroup" element={<JoinGroup />} />
            <Route path="/GroupDetails" element={<GroupDetails />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
