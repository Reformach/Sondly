import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(() => {
    // Пытаемся получить данные из localStorage при инициализации
    const savedData = localStorage.getItem('userData');
    return savedData 
      ? JSON.parse(savedData)
      : { id: null, favoritesPlaylist: null };
  });

  useEffect(() => {
    // Сохраняем данные пользователя в localStorage при изменении
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
    }
    
    // Если у пользователя есть ID, загружаем его избранное
    if (userData && userData.id) {
      loadFavorites(userData.id);
    }
  }, [userData?.id]); // Зависимость только от ID

  // Добавляем функцию выхода
  const logout = () => {
    localStorage.removeItem('userData');
    setUserData({ id: null, favoritesPlaylist: null });
  };

  const loadFavorites = async (userId) => {
    try {
      const response = await axios.get('http://localhost:4000/get-favorites', {
        params: { userId }
      });
      
      // Функция для форматирования пути к обложке
      const formatImagePath = (imagePath) => {
        if (!imagePath) return process.env.PUBLIC_URL + '/default-cover.jpg';
        
        // Если путь начинается с http, оставляем как есть
        if (imagePath.startsWith('http')) return imagePath;
        
        // Если путь относительный, добавляем базовый URL
        if (imagePath.startsWith('/')) {
          if (imagePath === '/default-cover.jpg') {
            return process.env.PUBLIC_URL + '/default-cover.jpg';
          }
          return `http://localhost:4000${imagePath}`;
        } else {
          return `http://localhost:4000/${imagePath}`;
        }
      };
      
      // Обработка треков - убедимся, что все поля присутствуют
      const processedTracks = (response.data.tracks || []).map(track => {
        // Если у трека нет альбома, создаем базовую структуру
        if (!track.album) {
          track.album = {
            image_src: process.env.PUBLIC_URL + '/default-cover.jpg',
            executor_name: 'Неизвестный исполнитель',
            executor: 'Неизвестный исполнитель'
          };
        } else {
          // Если альбом есть, убедимся что в нем есть все нужные поля
          // и что путь к обложке корректный
          track.album = {
            ...track.album,
            image_src: formatImagePath(track.album.image_src),
            executor_name: track.album.executor_name || track.album.executor || 'Неизвестный исполнитель',
            executor: track.album.executor || track.album.executor_name || 'Неизвестный исполнитель'
          };
        }
        return track;
      });
      
      console.log("Обработанные треки избранного:", processedTracks);
      if (processedTracks.length > 0) {
        console.log("Пример обработанного трека:", processedTracks[0]);
        console.log("Обложка трека:", processedTracks[0].album.image_src);
      }
      
      // Всегда сохраняем объект с tracks, даже если их нет
      setUserData(prev => ({
        ...prev,
        favoritesPlaylist: {
          id: response.data.id,
          tracks: processedTracks // Используем обработанные треки
        }
      }));
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error);
      // При ошибке сохраняем пустой плейлист
      setUserData(prev => ({
        ...prev,
        favoritesPlaylist: {
          id: null,
          tracks: []
        }
      }));
    }
  };

  const isTrackLiked = (trackId) => {
    if (!userData.favoritesPlaylist?.tracks) return false;
    return userData.favoritesPlaylist.tracks.some(track => track.id === trackId);
  };

  return (
    <UserContext.Provider 
      value={{ 
        userData, 
        setUserData,
        loadFavorites,
        isTrackLiked,
        logout
      }}
    >
      {children}
    </UserContext.Provider>
  );
};