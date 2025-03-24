import './App.css';
import MainPage from './modules/pages/MainPage';
import TracksPage from './modules/pages/TracksPage';
import {React, useState} from 'react';
import { UserProvider } from './modules/context/UserContext';
import Authentication from './modules/common components/Authentication'; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PlaylistsPage from './modules/pages/PlaylistsPage';
import { useContext, useEffect } from 'react';

const App = () => {

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(true);
  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false); // Закрываем модальное окно
  };
  return (
    <UserProvider>
      <Router>
        {isAuthModalOpen && (
          <Authentication onAuthSuccess={handleAuthSuccess} onClose={() => setIsAuthModalOpen(false)} />
        )}
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/favorite" element={<TracksPage description={"Избранное"}  titleTracklist={"Треки"}/>} />
          <Route path="/playlists" element={<PlaylistsPage description={"Избранное"}  titleTracklist={"Треки"}/>} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;