import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Reports from './pages/Reports/Reports';
import AIRecommendations from './pages/AIRecommendations/AIRecommendations';
import About from './pages/About/About';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <div className="app-container">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/ai-recommendations" element={<AIRecommendations />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
        </div>
      </Router>
    </Provider>
  );
};

export default App;
