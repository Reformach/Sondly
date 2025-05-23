import './App.css';
import MainPage from './modules/pages/MainPage';
import TracksPage from './modules/pages/TracksPage';
import {React, useState, useEffect, useContext} from 'react';
import { UserProvider, UserContext } from './modules/context/UserContext';
import Authentication from './modules/common components/Authentication'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PlaylistsPage from './modules/pages/PlaylistsPage';
import ExecutorPage from './modules/pages/ExecutorPage';
import GenresPage from './modules/pages/GenresPage';
import GenreTracksPage from './modules/pages/GenreTracksPage';
import AdminPage from './modules/pages/AdminPage';

const AppContent = () => {
  const { userData, isAdmin } = useContext(UserContext);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(!userData.id);
  
  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <>
      {isAuthModalOpen && (
        <Authentication onAuthSuccess={handleAuthSuccess} onClose={() => setIsAuthModalOpen(false)} />
      )}
      <Routes>
        <Route path="/" element={isAdmin() ? <AdminPage /> : <MainPage/>}/>
        <Route path="/favorite" element={<TracksPage description={"Избранное"} titleTracklist={"Треки"} isFavorite={true}/>} />
        <Route path="/playlists" element={<PlaylistsPage description={"Плейлисты"} titleTracklist={"Треки"}/>} />
        <Route path="/playlist/:playlistId" element={<TracksPage description={"Треки"} titleTracklist={"Треки"} isFavorite={false}/>} />
        <Route path="/executor/:executorId" element={<ExecutorPage />} />
        <Route path="/genres" element={<GenresPage />} />
        <Route path="/genre/:genreId" element={<GenreTracksPage />} />
        <Route path="/album/:albumId" element={<TracksPage description={"Альбом"} titleTracklist={"Треки альбома"} isAlbum={true} />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

export default App;