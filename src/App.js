import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LogIn from "./LogIn";
import HomePage from './HomePage';
import Registration from './Registration';
import ForgotPassword from './ForgotPassword';
import SelectArtists from './SelectArtists';
import SelectSongs from './SelectSongs';
import SentEmail from './SentEmail'

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LogIn />} />
          <Route path="/HomePage" element={<HomePage />} />
          <Route path="/Registration" element={<Registration />} />
          <Route path="/ForgotPassword" element={<ForgotPassword />} />
          <Route path="/SelectArtists" element={<SelectArtists />} />
          <Route path="/selectSongs" element={<SelectSongs />} />
          <Route path="/sentEmail" element={<SentEmail />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
