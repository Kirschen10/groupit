import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LogIn from "./LogIn";
import HomePage from './HomePage';
import Registration from './Registration';
import ForgotPassword from './ForgotPassword';
import Profile from './Profile';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LogIn />} />
          <Route path="/HomePage" element={<HomePage />} />
          <Route path="/Registration" element={<Registration />} />
          <Route path="/ForgotPassword" element={<ForgotPassword />} />
          <Route path="/Profile" element={<Profile />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
