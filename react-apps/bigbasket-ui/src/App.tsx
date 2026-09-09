import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import Offers from './pages/Offers';
import SmartBasket from './pages/SmartBasket';
import TrackingPage from './pages/TrackingPage';
import { ThemeProvider } from './context/ThemeContext';
import './styles/main.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[var(--color-background)]">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/smart-basket" element={<SmartBasket />} />
          <Route path="/track" element={<TrackingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;