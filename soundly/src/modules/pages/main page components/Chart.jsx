import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import ChartStroke from './ChartStroke';
import { PlayerContext } from '../../context/PlayerContext';
import { UserContext } from '../../context/UserContext';

const Chart = ({ title, titleBtn, hrefBtn, isFavorites, playlistId, playlist, customTracks, isTopChart, limit = 10 }) => {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(false);
    const [topTracks, setTopTracks] = useState([]);
    const { userData, loadFavorites } = useContext(UserContext);
    const { handleTrackSelect, setTracks } = useContext(PlayerContext);

    // Исправляем треки для правильного отображения данных
    const normalizeTrack = (track) => {
        const normalizedTrack = { ...track };
        
        // Обеспечиваем правильную структуру альбома
        if (!normalizedTrack.album) {
            normalizedTrack.album = {
                image_src: process.env.PUBLIC_URL + '/default-cover.jpg',
                executor_name: 'Неизвестный исполнитель',
                executor: 'Неизвестный исполнитель'
            };
        } else {
            // Корректируем относительные пути, добавляя базовый URL
            let imageSrc = normalizedTrack.album.image_src || '/default-cover.jpg';
            
            // Если путь относительный и не начинается с http, добавляем базовый URL
            if (imageSrc && !imageSrc.startsWith('http') && !imageSrc.startsWith(process.env.PUBLIC_URL)) {
                // Если путь начинается со слэша, не добавляем еще один
                if (imageSrc.startsWith('/')) {
                    imageSrc = `http://localhost:4000${imageSrc}`;
                } else {
                    imageSrc = `http://localhost:4000/${imageSrc}`;
                }
            }
            
            // Исправляем путь к обложке при необходимости
            if (imageSrc === '/default-cover.jpg') {
                imageSrc = process.env.PUBLIC_URL + '/default-cover.jpg';
            }
            
            // Гарантируем, что у альбома есть все необходимые поля
            normalizedTrack.album = {
                ...normalizedTrack.album,
                image_src: imageSrc,
                executor_name: normalizedTrack.album.executor_name || 
                               normalizedTrack.album.executor || 
                               'Неизвестный исполнитель',
                executor: normalizedTrack.album.executor || 
                          normalizedTrack.album.executor_name || 
                          'Неизвестный исполнитель'
            };
        }
        
        return normalizedTrack;
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Если это компонент с популярными треками
                if (isTopChart) {
                    // Запрашиваем топ треков по количеству прослушиваний
                    const response = await axios.get(`http://localhost:4000/get-top-tracks?limit=${limit}`);
                    
                    // Нормализуем треки
                    const normalizedTracks = response.data.map(normalizeTrack);
                    
                    // Устанавливаем треки в состояние и контекст плеера
                    setTopTracks(normalizedTracks);
                    setTracks(normalizedTracks);
                }
                // Если переданы пользовательские треки, используем их
                else if (customTracks && customTracks.length > 0) {
                    const normalizedTracks = customTracks.map(normalizeTrack);
                    setTracks(normalizedTracks);
                } else if (isFavorites) {
                    if (userData.id) {
                        await loadFavorites(userData.id);
                        console.log("Треки избранного:", userData.favoritesPlaylist?.tracks);
                        
                        // Если есть треки в избранном, улучшаем их структуру данных
                        if (userData.favoritesPlaylist?.tracks && userData.favoritesPlaylist.tracks.length > 0) {
                            console.log("Пример трека из избранного:", userData.favoritesPlaylist.tracks[0]);
                            console.log("Альбом трека:", userData.favoritesPlaylist.tracks[0].album);
                            
                            // Нормализуем треки из избранного
                            const normalizedTracks = userData.favoritesPlaylist.tracks.map(normalizeTrack);
                            setTracks(normalizedTracks);
                        }
                    }
                } else if (playlistId && playlist) {
                    // Плейлист уже загружен из родительского компонента
                    // Обеспечиваем, что у всех треков есть все необходимые данные
                    const allTracks = playlist.tracks.map(track => {
                        console.log("Необработанный трек плейлиста:", track);
                        return normalizeTrack(track);
                    });
                    console.log("Треки из плейлиста (обработанные):", allTracks);
                    setTracks(allTracks);
                } else {
                    const response = await axios.get('http://localhost:4000/get-albums-and-tracks');
                    setAlbums(response.data);
                    const allTracks = response.data.flatMap(album => 
                        album.tracks.map(track => normalizeTrack({ ...track, album }))
                    );
                    console.log("Треки из всех альбомов:", allTracks);
                    setTracks(allTracks);
                }
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isFavorites, userData.id, playlistId, playlist, customTracks, isTopChart, limit, setTracks]);

    if (loading) {
        return <div className="loading-message">Загрузка...</div>;
    }

    // Защита от undefined при первом рендере
    const favoriteTracks = userData.favoritesPlaylist?.tracks || [];
    // Треки из плейлиста (если это плейлист)
    const playlistTracks = playlist?.tracks || [];

    return (
        <section className="chart">
            <div className="chart-header">
                <h2>{title}</h2>
                <a href={hrefBtn} className="more-see-text">{titleBtn}</a>
            </div>
            <div className="line-header-chart"></div>
            <ol className="chart-list">
                {isFavorites ? (
                    favoriteTracks.length > 0 ? (
                        favoriteTracks.map(track => (
                            <ChartStroke
                                key={track.id}
                                coverImage={track.album?.image_src || '/default-cover.jpg'}
                                title={track.name || track.title || 'Неизвестный трек'}
                                artist={track.album?.executor_name || track.album?.executor || 'Неизвестный исполнитель'}
                                duration={track.duration}
                                onClick={() => handleTrackSelect({...track, album: track.album})}
                                trackId={track.id}
                            />
                        ))
                    ) : (
                        <div className="empty-message">
                            {userData.id 
                                ? "Ваш плейлист 'Избранное' пуст" 
                                : "Войдите, чтобы увидеть избранные треки"}
                        </div>
                    )
                ) : playlistId && playlist ? (
                    playlistTracks.length > 0 ? (
                        playlistTracks.map(track => (
                            <ChartStroke
                                key={track.id}
                                coverImage={track.album?.image_src || '/default-cover.jpg'}
                                title={track.name || track.title || 'Неизвестный трек'}
                                artist={track.album?.executor_name || track.album?.executor || 'Неизвестный исполнитель'}
                                duration={track.duration}
                                onClick={() => handleTrackSelect({...track, album: track.album})}
                                trackId={track.id}
                            />
                        ))
                    ) : (
                        <div className="empty-message">В этом плейлисте нет треков</div>
                    )
                ) : isTopChart ? (
                    // Для isTopChart используем topTracks из состояния
                    topTracks.length > 0 ? (
                        topTracks.map((track, index) => (
                            <ChartStroke
                                key={track.id}
                                coverImage={track.album?.image_src || '/default-cover.jpg'}
                                title={track.name || track.title || 'Неизвестный трек'}
                                artist={track.album?.executor_name || track.album?.executor || 'Неизвестный исполнитель'}
                                duration={track.duration}
                                onClick={() => handleTrackSelect({...track, album: track.album})}
                                trackId={track.id}
                                playCount={track.number_of_plays || 0}
                                position={index + 1}
                            />
                        ))
                    ) : (
                        <div className="empty-message">Нет данных о популярных треках</div>
                    )
                ) : customTracks && customTracks.length > 0 ? (
                    // Отображаем пользовательские треки
                    customTracks.map(track => (
                        <ChartStroke
                            key={track.id}
                            coverImage={track.album?.image_src || '/default-cover.jpg'}
                            title={track.name || track.title || 'Неизвестный трек'}
                            artist={track.album?.executor_name || track.album?.executor || 'Неизвестный исполнитель'}
                            duration={track.duration}
                            onClick={() => handleTrackSelect({...track, album: track.album})}
                            trackId={track.id}
                        />
                    ))
                ) : (
                    albums.flatMap(album => 
                        album.tracks.map((track, index) => (
                            <ChartStroke
                                key={track.id}
                                coverImage={album.image_src || '/default-cover.jpg'}
                                title={track.name || track.title || 'Неизвестный трек'}
                                artist={album.executor_name || album.executor || 'Неизвестный исполнитель'}
                                duration={track.duration}
                                onClick={() => handleTrackSelect({...track, album})}
                                trackId={track.id}
                            />
                        ))
                    )
                )}
            </ol>
        </section>
    );
};

export default Chart;