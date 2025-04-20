import LeftPanel from "../common components/LeftPanel";
import HeaderPage from "../common components/HeaderPage";
import PageSwitchingButtons from "../common components/PageSwitchingButtons";
import Chart from "./main page components/Chart";
import Player from "../common components/Player";
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { UserContext } from '../context/UserContext';
import { PlayerProvider } from '../context/PlayerContext';
import React, { useContext, useState, useEffect } from 'react';
import PanelHeaderExecutor from "./executor page component/PanelHeaderExecutor";
import Playlists from "./main page components/Playlists";

const ExecutorPage = () => {
    const { executorId } = useParams();
    const navigate = useNavigate();
    const [executor, setExecutor] = useState(null);
    const [executorTracks, setExecutorTracks] = useState([]);
    const [executorAlbums, setExecutorAlbums] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchExecutorData = async () => {
            if (!executorId) return;
            
            setLoading(true);
            try {
                // Получаем данные о музыканте
                const response = await axios.get(`http://localhost:4000/get-executor/${executorId}`);
                setExecutor(response.data);
                
                // Получаем треки и альбомы музыканта
                const contentResponse = await axios.get(`http://localhost:4000/get-executor-content/${executorId}`);
                setExecutorTracks(contentResponse.data.tracks || []);
                setExecutorAlbums(contentResponse.data.albums || []);
            } catch (err) {
                console.error('Ошибка при загрузке данных музыканта:', err);
                setError('Не удалось загрузить информацию о музыканте');
            } finally {
                setLoading(false);
            }
        };
        
        fetchExecutorData();
    }, [executorId]);

    const handleAlbumClick = (albumId) => {
        navigate(`/album/${albumId}`);
    };

    return (
        <PlayerProvider>
            <LeftPanel />
            <main className="content">
                <HeaderPage />
                <PageSwitchingButtons />
                {loading ? (
                    <div className="loading-message">Загрузка данных музыканта...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <>
                        <PanelHeaderExecutor 
                            description={"Музыкант"} 
                            executor={executor} 
                        />
                        <section className="main-content">
                            <Chart
                                title={"Треки"}
                                titleBtn={"Показать больше"}
                                hrefBtn={"/tracks"}
                                isFavorite={false}
                                customTracks={executorTracks}
                            />
                            <div className="executor-albums">
                                <h2 className="section-title">Альбомы музыканта</h2>
                                <div className="albums-grid">
                                    {executorAlbums.length > 0 ? (
                                        executorAlbums.map(album => (
                                            <div 
                                                key={album.id} 
                                                className="album-card"
                                                onClick={() => handleAlbumClick(album.id)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <img 
                                                    src={`http://localhost:4000/${album.image_src}` || 'http://localhost:4000/default-cover.jpg'} 
                                                    alt={album.name} 
                                                    className="album-cover" 
                                                />
                                                <div className="album-info">
                                                    <h3 className="album-title">{album.name}</h3>
                                                    <span className="album-year">
                                                        {new Date(album.release_date).getFullYear()}
                                                    </span>
                                                    <span className="tracks-count">
                                                        {album.tracks_count || 0} треков
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-albums-message">У исполнителя пока нет альбомов</p>
                                    )}
                                </div>
                            </div>
                        </section>
                    </>
                )}
                <Player />
            </main>
        </PlayerProvider>
    );
};

export default ExecutorPage;