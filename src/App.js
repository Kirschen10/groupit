import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LogIn from "./LogIn";
import HelloWorld from "./HelloWorld";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LogIn />} />
          <Route path="/HelloWorld" element={<HelloWorld />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
