import './App.css';
import MainPage from './modules/pages/MainPage';
import FavoritePage from './modules/pages/FavoritePage';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage/>} />
        <Route path="/favorite" element={<FavoritePage/>} />
      </Routes>
    </Router>
    // <MainPage/>
  );
}

export default App;