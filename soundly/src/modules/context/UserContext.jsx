import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(() => {
    // Пытаемся получить данные из localStorage при инициализации
    const savedData = localStorage.getItem('userData');
    return savedData 
      ? JSON.parse(savedData)
      : { id: null, favoritesPlaylist: null, isAdmin: false };
  });

  // Добавляем состояние для отслеживания времени последней загрузки избранного
  const [lastFavoritesLoad, setLastFavoritesLoad] = useState(null);
  
  // Добавляем состояние для отслеживания, идет ли загрузка в данный момент
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

  useEffect(() => {
    // Сохраняем данные пользователя в localStorage при изменении
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
    }
    
    // Если у пользователя есть ID, загружаем его избранное только при первом рендере или смене пользователя
    if (userData && userData.id && shouldReloadFavorites()) {
      loadFavorites(userData.id);
    }
  }, [userData?.id]); // Зависимость только от ID

  // Функция для проверки необходимости перезагрузки избранного
  const shouldReloadFavorites = () => {
    // Если идет загрузка, не нужно запускать еще одну
    if (isLoadingFavorites) {
      return false;
    }
    
    // Если данные никогда не загружались, нужно загрузить
    if (!lastFavoritesLoad) {
      return true;
    }
    
    // Если данные загружались более 5 минут назад, обновляем
    const CACHE_TIME = 5 * 60 * 1000; // 5 минут в миллисекундах
    return Date.now() - lastFavoritesLoad > CACHE_TIME;
  };

  // Добавляем функцию выхода
  const logout = () => {
    localStorage.removeItem('userData');
    setUserData({ id: null, favoritesPlaylist: null, isAdmin: false });
    setLastFavoritesLoad(null);
  };

  const loadFavorites = async (userId) => {
    // Если загрузка уже идет или кеш еще свежий, не запускаем повторную загрузку
    if (isLoadingFavorites || !shouldReloadFavorites()) {
      console.log("Пропускаю загрузку избранного - данные уже загружаются или недавно загружены");
      return;
    }
    
    setIsLoadingFavorites(true);
    
    try {
      console.log("Загружаю избранное с сервера для userId:", userId);
      const response = await axios.get('http://localhost:4000/get-favorites', {
        params: { userId }
      });
      
      // Обновляем время последней загрузки
      setLastFavoritesLoad(Date.now());
      
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
      
      console.log("Обработанные треки избранного:", processedTracks.length);
      
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
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  // Принудительное обновление избранного (например, после добавления треков)
  const forceFavoritesReload = () => {
    if (userData?.id) {
      setLastFavoritesLoad(null); // Сбрасываем время последней загрузки
      loadFavorites(userData.id);
    }
  };

  const isTrackLiked = (trackId) => {
    if (!userData.favoritesPlaylist?.tracks) return false;
    return userData.favoritesPlaylist.tracks.some(track => track.id === trackId);
  };

  // Проверка, является ли пользователь администратором
  const isAdmin = () => {
    return userData?.isAdmin === true;
  };

  return (
    <UserContext.Provider 
      value={{ 
        userData, 
        setUserData,
        loadFavorites,
        forceFavoritesReload,
        isTrackLiked,
        logout,
        isAdmin
      }}
    >
      {children}
    </UserContext.Provider>
  );
};