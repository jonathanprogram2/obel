import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Explore from './pages/Explore';
import './index.css';
import CoinIntel from "./pages/CoinIntel";

const App = () => {
    return (
        <Router>
            <div className="min-h-screen bg-black text-white">
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/coin-intel" element={<CoinIntel />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;