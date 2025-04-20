import { Icon } from '@iconify/react';
import { useContext, useState, useEffect } from 'react';
import { UserContext } from '../../context/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ChartStroke = ({ coverImage, title, artist, duration, onClick, trackId, executorId, playCount, position }) => {
    const { userData, isTrackLiked, forceFavoritesReload, setUserData } = useContext(UserContext);
    const [isLiked, setIsLiked] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [loadingPlaylists, setLoadingPlaylists] = useState(false);
    const [addingToPlaylist, setAddingToPlaylist] = useState(false);
    const navigate = useNavigate();
  
    // Корректируем путь к обложке
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
    
    // Проверяем и устанавливаем значения по умолчанию
    const displayCoverImage = formatImagePath(coverImage);
    const displayTitle = title || 'Неизвестный трек';
    const displayArtist = artist || 'Неизвестный исполнитель';
  
    useEffect(() => {
      setIsLiked(isTrackLiked(trackId));
    }, [trackId, userData.favoritesPlaylist?.tracks, isTrackLiked]);
  
    const handleLike = async (e) => {
      e.stopPropagation();
      
      // Проверяем все необходимые условия
      if (!userData.id || !userData.favoritesPlaylist?.id || isProcessing) {
        if (!userData.id) {
          alert('Войдите, чтобы добавлять треки в избранное');
        }
        return;
      }
      
      setIsProcessing(true);
      
      // Оптимистичное обновление интерфейса - меняем состояние сразу
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      
      // Создаем копию текущего списка избранных треков
      const currentTracks = [...(userData.favoritesPlaylist?.tracks || [])];
      let updatedTracks;
      
      if (newIsLiked) {
        // Если добавляем в избранное - находим трек по ID в имеющихся данных
        // и добавляем его в массив
        const trackData = { id: trackId, name: title, album: { executor_name: artist, image_src: coverImage } };
        updatedTracks = [...currentTracks, trackData];
      } else {
        // Если удаляем из избранного - фильтруем массив
        updatedTracks = currentTracks.filter(track => track.id !== trackId);
      }
      
      // Обновляем состояние context без запроса к серверу
      setUserData(prev => ({
        ...prev,
        favoritesPlaylist: {
          ...prev.favoritesPlaylist,
          tracks: updatedTracks
        }
      }));
      
      try {
        // Обновляем данные на сервере
        await axios.post('http://localhost:4000/update-favorites', {
          playlistId: userData.favoritesPlaylist.id,
          trackId: trackId,
          action: newIsLiked ? 'add' : 'remove'
        });
        
        // Не вызываем loadFavorites после каждого обновления
        // Данные уже обновлены локально
      } catch (error) {
        console.error('Ошибка:', error);
        // При ошибке откатываем локальные изменения
        setIsLiked(!newIsLiked);
        // И только в случае ошибки принудительно перезагружаем данные с сервера
        forceFavoritesReload();
      } finally {
        setIsProcessing(false);
      }
    };

    // Обработчик клика по имени исполнителя
    const handleArtistClick = (e) => {
        e.stopPropagation(); // Предотвращаем всплытие события клика
        
        // Если передан ID исполнителя, используем его, 
        // иначе пытаемся получить ID из альбома трека
        if (executorId) {
            navigate(`/executor/${executorId}`);
        } else {
            // Получаем ID исполнителя и переходим на его страницу
            // Здесь может потребоваться запрос на сервер, чтобы получить ID исполнителя по имени
            // Это зависит от структуры вашего API
            axios.get(`http://localhost:4000/get-executor-by-name?name=${encodeURIComponent(displayArtist)}`)
                .then(response => {
                    if (response.data && response.data.id) {
                        navigate(`/executor/${response.data.id}`);
                    } else {
                        console.error('Не удалось найти исполнителя');
                    }
                })
                .catch(error => {
                    console.error('Ошибка при поиске исполнителя:', error);
                });
        }
    };

    const openPlaylistModal = async (e) => {
      e.stopPropagation();
      
      if (!userData.id) {
        alert('Войдите, чтобы добавлять треки в плейлисты');
        return;
      }
      
      setIsPlaylistModalOpen(true);
      await loadUserPlaylists();
    };
    
    const closePlaylistModal = (e) => {
      if (e) e.stopPropagation();
      setIsPlaylistModalOpen(false);
    };
    
    const loadUserPlaylists = async () => {
      setLoadingPlaylists(true);
      try {
        const response = await axios.get('http://localhost:4000/get-user-playlists', {
          params: { userId: userData.id }
        });
        // Фильтруем плейлисты, исключая "Избранное"
        setUserPlaylists(response.data.filter(playlist => !playlist.isFavorites));
      } catch (error) {
        console.error('Ошибка при загрузке плейлистов:', error);
      } finally {
        setLoadingPlaylists(false);
      }
    };
    
    const addToPlaylist = async (playlistId) => {
      setAddingToPlaylist(true);
      try {
        await axios.post('http://localhost:4000/update-playlist', {
          playlistId,
          trackId,
          action: 'add'
        });
        closePlaylistModal();
      } catch (error) {
        console.error('Ошибка при добавлении трека в плейлист:', error);
        alert('Не удалось добавить трек в плейлист');
      } finally {
        setAddingToPlaylist(false);
      }
    };

    return (
        <li className="chart-stroke" onClick={onClick}>
            <div className="name-and-description">
            <button 
                      className={`like-button ${isProcessing ? 'processing' : ''}`}
                      onClick={handleLike}
                      disabled={isProcessing}
                      aria-label={isLiked ? "Удалить из избранного" : "Добавить в избранное"}
                    >
                        <Icon 
                          icon={isLiked ? "solar:heart-bold" : "solar:heart-outline"} 
                          className={`like-button-icon ${isLiked ? 'liked' : ''}`} 
                        />
                    </button>
                <img src={displayCoverImage} alt="Обложка альбома" className='image-track'/>
                <div className="description-container">
                    <span className="chart-title">{displayTitle}</span>
                    <span 
                        className="chart-artist clickable" 
                        onClick={handleArtistClick}
                    >
                        {displayArtist}
                    </span>
                </div>
            </div>
            <div className="chart-interaction">
            {playCount !== undefined && (
                        <div className="play-count">
                            <Icon icon="solar:headphones-round-linear" className="play-count-icon" />
                            <span>{playCount}</span>
                        </div>
                    )}
                <button className="play-music">
                    <Icon icon="solar:play-line-duotone" className="play-button-icon-chart" />
                </button>
                <div className="like-and-time">
                    <button 
                      className="add-to-playlist-button"
                      onClick={openPlaylistModal}
                      aria-label="Добавить в плейлист"
                    >
                        <Icon icon="tabler:playlist-add" className="add-to-playlist-icon" />
                    </button>
                    <p>{duration}</p>
                </div>
            </div>
            
            {isPlaylistModalOpen && (
                <div className="playlist-modal-overlay" onClick={closePlaylistModal}>
                    <div className="playlist-select-modal" onClick={e => e.stopPropagation()}>
                        <div className="playlist-modal-header">
                            <h3>Добавить в плейлист</h3>
                            <button className="close-button" onClick={closePlaylistModal}>
                                <Icon icon="solar:close-circle-linear" />
                            </button>
                        </div>
                        
                        <div className="track-info-container">
                            <img src={displayCoverImage} alt="Обложка" className="track-modal-cover" />
                            <div className="track-modal-details">
                                <span className="track-modal-title">{displayTitle}</span>
                                <span className="track-modal-artist">{displayArtist}</span>
                            </div>
                        </div>
                        
                        <div className="playlists-container">
                            {loadingPlaylists ? (
                                <p className="loading-text">Загрузка плейлистов...</p>
                            ) : userPlaylists.length > 0 ? (
                                <ul className="playlists-list">
                                    {userPlaylists.map(playlist => (
                                        <li 
                                            key={playlist.id} 
                                            className="playlist-option"
                                            onClick={() => addToPlaylist(playlist.id)}
                                        >
                                            <div className="playlist-option-details">
                                                <span className="playlist-option-name">{playlist.name}</span>
                                                <span className="playlist-option-count">
                                                    {playlist.tracks?.length || 0} треков
                                                </span>
                                            </div>
                                            <button 
                                                className="add-to-playlist-btn"
                                                disabled={addingToPlaylist}
                                            >
                                                <Icon icon="solar:add-circle-linear" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="no-playlists-message">
                                    <p>У вас пока нет плейлистов</p>
                                    <button 
                                        className="create-playlist-btn"
                                        onClick={() => {
                                            closePlaylistModal();
                                            // Можно добавить переход на страницу создания плейлиста
                                            window.location.href = '/playlists';
                                        }}
                                    >
                                        Создать плейлист
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </li>
    );
};

export default ChartStroke;