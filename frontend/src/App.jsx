import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import Players from './pages/Players'
import Games from './pages/Games'
import Prizes from './pages/Prizes'
import Moves from './pages/Moves'

// Components
import Navigation from './components/Navigation';


function App() {

    return (
        <>
            <Navigation />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/players" element={<Players />} />
                <Route path="/games" element={<Games />} />
                <Route path="/prizes" element={<Prizes />} />
                <Route path="/moves" element={<Moves />} />
            </Routes>
        </>
    );

} export default App;