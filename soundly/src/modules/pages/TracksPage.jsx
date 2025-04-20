import LeftPanel from "../common components/LeftPanel";
import HeaderPage from "../common components/HeaderPage";
import PanelHeader from "../common components/PanelHeader";
import PageSwitchingButtons from "../common components/PageSwitchingButtons";
import Player from "../common components/Player";
import Chart from "./main page components/Chart";
import { PlayerProvider } from '../context/PlayerContext';
import { UserContext } from '../context/UserContext';
import { useContext, useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

const TracksPage = ({description, titleTracklist, isFavorite, isAlbum}) => {
    const { userData, loadFavorites } = useContext(UserContext);
    const { playlistId, albumId } = useParams();
    const [playlist, setPlaylist] = useState(null);
    const [album, setAlbum] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const location = useLocation();
    
    // Отслеживаем первое отображение страницы
    const [initialLoadDone, setInitialLoadDone] = useState(false);

    useEffect(() => {
        // Сбрасываем флаг при смене пути
        if (!initialLoadDone) {
            setInitialLoadDone(true);
            
            if (isFavorite && userData.id) {
                // При отображении Избранного не нужно делать дополнительных загрузок
                // loadFavorites теперь защищен от лишних вызовов
                loadFavorites(userData.id);
            } else if (playlistId) {
                // Загружаем плейлист
                const fetchPlaylist = async () => {
                    setLoading(true);
                    try {
                        const response = await axios.get(`http://localhost:4000/get-playlist/${playlistId}`);
                        setPlaylist(response.data);
                    } catch (error) {
                        console.error('Ошибка при загрузке плейлиста:', error);
                        setError('Не удалось загрузить плейлист');
                    } finally {
                        setLoading(false);
                    }
                };
                fetchPlaylist();
            } else if (isAlbum && albumId) {
                // Загружаем треки альбома
                const fetchAlbumTracks = async () => {
                    setLoading(true);
                    try {
                        const response = await axios.get(`http://localhost:4000/get-album-tracks/${albumId}`);
                        setAlbum(response.data.album);
                        setTracks(response.data.tracks);
                    } catch (error) {
                        console.error('Ошибка при загрузке треков альбома:', error);
                        setError('Не удалось загрузить треки альбома');
                    } finally {
                        setLoading(false);
                    }
                };
                fetchAlbumTracks();
            }
        }
    }, [isFavorite, userData.id, playlistId, isAlbum, albumId, loadFavorites, initialLoadDone]);

    // При изменении URL сбрасываем флаг initialLoadDone
    useEffect(() => {
        setInitialLoadDone(false);
    }, [location.pathname]);

    // Динамически меняем заголовок в зависимости от того, что отображается
    const getPageDescription = () => {
        if (isFavorite) {
            return "Избранное";
        } else if (playlist) {
            return playlist.name;
        } else if (album) {
            return album.name;
        }
        return description;
    };

    return (
        <PlayerProvider>
            <LeftPanel/>
            <main className="content">
                <HeaderPage/>
                <PageSwitchingButtons/>
                <PanelHeader description={getPageDescription()}/>
                {loading ? (
                    <div className="loading-message">Загрузка...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <section className="main-content">
                        {isAlbum ? (
                            <Chart 
                                title={titleTracklist} 
                                titleBtn="Назад к исполнителю" 
                                hrefBtn={album?.executor_id ? `/executor/${album.executor_id}` : "/"} 
                                customTracks={tracks}
                            />
                        ) : (
                            <Chart 
                                title={titleTracklist} 
                                titleBtn="Смотреть все" 
                                hrefBtn="#" 
                                isFavorites={isFavorite}
                                playlistId={playlistId}
                                playlist={playlist}
                            />
                        )}
                    </section>
                )}
                <Player/>
            </main>
        </PlayerProvider>
    )
}
export default TracksPage;