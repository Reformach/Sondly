import './App.css';
import MainPage from './modules/pages/MainPage';
import FavoritePage from './modules/pages/FavoritePage';
import {React, useState} from 'react';
import { UserProvider } from './modules/context/UserContext';
import Authentication from './modules/common components/Authentication'; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(true);
  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false); // Закрываем модальное окно
  };
  return (
    <UserProvider> {/* Оборачиваем все приложение в UserProvider */}
      <Router>
        {/* Показываем модальное окно аутентификации, если оно открыто */}
        {isAuthModalOpen && (
          <Authentication onAuthSuccess={handleAuthSuccess} onClose={() => setIsAuthModalOpen(false)} />
        )}

        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/favorite" element={<FavoritePage />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;