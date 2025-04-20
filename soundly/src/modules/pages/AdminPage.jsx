import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import LeftPanel from '../common components/LeftPanel';
import HeaderPage from '../common components/HeaderPage';
import PageSwitchingButtons from '../common components/PageSwitchingButtons';
import { UserContext } from '../context/UserContext';
import Player from '../common components/Player';
import { PlayerProvider } from '../context/PlayerContext';
import './AdminPage.css';

const AdminPage = () => {
  const { userData, isAdmin } = useContext(UserContext);
  const [selectedTab, setSelectedTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Проверяем права администратора
    if (!isAdmin()) {
      setError('У вас нет прав для просмотра этой страницы');
      return;
    }

    // Загружаем данные для выбранной вкладки
    loadData();
  }, [selectedTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      switch (selectedTab) {
        case 'users':
          response = await axios.get('http://localhost:4000/get-all-users');
          setUsers(response.data);
          break;
        case 'tracks':
          response = await axios.get('http://localhost:4000/get-all-tracks');
          setTracks(response.data);
          break;
        case 'albums':
          response = await axios.get('http://localhost:4000/get-all-albums');
          setAlbums(response.data);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) return;

    try {
      await axios.delete(`http://localhost:4000/delete-user/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Ошибка при удалении пользователя:', err);
      setError('Не удалось удалить пользователя');
    }
  };

  const handleDeleteTrack = async (trackId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот трек?')) return;

    try {
      await axios.delete(`http://localhost:4000/delete-track/${trackId}`);
      setTracks(tracks.filter(track => track.id !== trackId));
    } catch (err) {
      console.error('Ошибка при удалении трека:', err);
      setError('Не удалось удалить трек');
    }
  };

  const handleDeleteAlbum = async (albumId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот альбом? Это также удалит все треки альбома.')) return;

    try {
      await axios.delete(`http://localhost:4000/delete-album/${albumId}`);
      setAlbums(albums.filter(album => album.id !== albumId));
      // Также обновляем список треков, если мы находимся на вкладке треков
      if (selectedTab === 'tracks') {
        const tracksResponse = await axios.get('http://localhost:4000/get-all-tracks');
        setTracks(tracksResponse.data);
      }
    } catch (err) {
      console.error('Ошибка при удалении альбома:', err);
      setError('Не удалось удалить альбом');
    }
  };

  // Функция для форматирования даты
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Неизвестно';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ru-RU');
  };

  // Компонент для отображения вкладки с пользователями
  const UsersTab = () => (
    <div className="admin-tab">
      <h2>Управление пользователями</h2>
      {users.length === 0 ? (
        <p>Пользователи не найдены</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Аватар</th>
              <th>Имя</th>
              <th>Email</th>
              <th>Дата регистрации</th>
              <th>Роль</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <img 
                    src={user.avatar ? `http://localhost:4000/${user.avatar}` : '/default-avatar.png'} 
                    alt={user.nickname} 
                    className="user-avatar" 
                  />
                </td>
                <td>{user.nickname}</td>
                <td>{user.email}</td>
                <td>{formatDate(user.registration_date)}</td>
                <td>{user.isAdmin ? 'Администратор' : 'Пользователь'}</td>
                <td>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={user.isAdmin} // Запрещаем удалять администраторов
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // Компонент для отображения вкладки с треками
  const TracksTab = () => (
    <div className="admin-tab">
      <h2>Управление треками</h2>
      {tracks.length === 0 ? (
        <p>Треки не найдены</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Обложка</th>
              <th>Название</th>
              <th>Альбом</th>
              <th>Исполнитель</th>
              <th>Прослушиваний</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map(track => (
              <tr key={track.id}>
                <td>
                  <img 
                    src={track.album?.image_src || '/default-cover.jpg'} 
                    alt={track.name} 
                    className="track-cover" 
                  />
                </td>
                <td>{track.name}</td>
                <td>{track.album?.name || 'Без альбома'}</td>
                <td>{track.album?.executor_name || 'Неизвестный исполнитель'}</td>
                <td>{track.number_of_plays || 0}</td>
                <td>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteTrack(track.id)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // Компонент для отображения вкладки с альбомами
  const AlbumsTab = () => (
    <div className="admin-tab">
      <h2>Управление альбомами</h2>
      {albums.length === 0 ? (
        <p>Альбомы не найдены</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Обложка</th>
              <th>Название</th>
              <th>Исполнитель</th>
              <th>Жанр</th>
              <th>Дата выпуска</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {albums.map(album => (
              <tr key={album.id}>
                <td>
                  <img 
                    src={album.image_src ? `http://localhost:4000/${album.image_src}` : '/default-cover.jpg'} 
                    alt={album.name} 
                    className="album-cover" 
                  />
                </td>
                <td>{album.name}</td>
                <td>{album.executor_name || 'Неизвестный исполнитель'}</td>
                <td>{album.genre || 'Не указан'}</td>
                <td>{formatDate(album.release_date)}</td>
                <td>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteAlbum(album.id)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <PlayerProvider>
      {/* <LeftPanel /> */}
      <main className="content">
        <HeaderPage isAdmin={true}/>
        {/* <PageSwitchingButtons /> */}

        <div className="admin-page">
          <h1 className="admin-title">Панель администратора</h1>
          
          {error ? (
            <div className="error-message">{error}</div>
          ) : (
            <>
              <div className="admin-tabs">
                <button 
                  className={`tab-btn ${selectedTab === 'users' ? 'active' : ''}`}
                  onClick={() => setSelectedTab('users')}
                >
                  Пользователи
                </button>
                <button 
                  className={`tab-btn ${selectedTab === 'tracks' ? 'active' : ''}`}
                  onClick={() => setSelectedTab('tracks')}
                >
                  Треки
                </button>
                <button 
                  className={`tab-btn ${selectedTab === 'albums' ? 'active' : ''}`}
                  onClick={() => setSelectedTab('albums')}
                >
                  Альбомы
                </button>
              </div>
              
              {loading ? (
                <div className="loading-message">Загрузка данных...</div>
              ) : (
                <div className="admin-content">
                  {selectedTab === 'users' && <UsersTab />}
                  {selectedTab === 'tracks' && <TracksTab />}
                  {selectedTab === 'albums' && <AlbumsTab />}
                </div>
              )}
            </>
          )}
        </div>

        <Player />
      </main>
    </PlayerProvider>
  );
};

export default AdminPage; 