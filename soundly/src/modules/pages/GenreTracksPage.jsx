import React, { useState, useEffect } from 'react';
import LeftPanel from "../common components/LeftPanel";
import HeaderPage from "../common components/HeaderPage";
import PanelHeader from "../common components/PanelHeader";
import PageSwitchingButtons from "../common components/PageSwitchingButtons";
import Player from "../common components/Player";
import Chart from "./main page components/Chart";
import { PlayerProvider } from '../context/PlayerContext';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const GenreTracksPage = () => {
    const { genreId } = useParams();
    const [genre, setGenre] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGenreTracks = async () => {
            if (!genreId) return;
            
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:4000/get-tracks-by-genre/${genreId}`);
                setGenre(response.data.genre);
                setTracks(response.data.tracks);
            } catch (err) {
                console.error('Ошибка при загрузке треков по жанру:', err);
                setError('Не удалось загрузить треки для выбранного жанра');
            } finally {
                setLoading(false);
            }
        };
        
        fetchGenreTracks();
    }, [genreId]);

    return (
        <PlayerProvider>
            <LeftPanel />
            <main className="content">
                <HeaderPage />
                <PageSwitchingButtons />
                {loading ? (
                    <div className="loading-message">Загрузка треков...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <>
                        <PanelHeader 
                            description={genre ? `Жанр: ${genre.name}` : 'Жанр'} 
                        />
                        <section className="main-content">
                            <Chart
                                title={genre ? `Треки в жанре ${genre.name}` : 'Треки'}
                                titleBtn={"Назад к жанрам"}
                                hrefBtn={"/genres"}
                                customTracks={tracks}
                            />
                        </section>
                    </>
                )}
                <Player />
            </main>
        </PlayerProvider>
    );
};

export default GenreTracksPage; 