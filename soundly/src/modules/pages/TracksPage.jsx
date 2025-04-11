import LeftPanel from "../common components/LeftPanel";
import HeaderPage from "../common components/HeaderPage";
import PanelHeader from "../common components/PanelHeader";
import PageSwitchingButtons from "../common components/PageSwitchingButtons";
import Player from "../common components/Player";
import Chart from "./main page components/Chart";
import { PlayerProvider } from '../context/PlayerContext';
import { UserContext } from '../context/UserContext';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const TracksPage = ({description, titleTracklist, isFavorite}) => {
    const { userData, loadFavorites } = useContext(UserContext);
    const { playlistId } = useParams();
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isFavorite && userData.id) {
            loadFavorites(userData.id);
        } else if (playlistId) {
            const fetchPlaylist = async () => {
                setLoading(true);
                try {
                    const response = await axios.get(`http://localhost:4000/get-playlist/${playlistId}`);
                    setPlaylist(response.data);
                } catch (error) {
                    console.error('Ошибка при загрузке плейлиста:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchPlaylist();
        }
    }, [isFavorite, userData.id, playlistId]);

    // Динамически меняем заголовок в зависимости от того, что отображается
    const getPageDescription = () => {
        if (isFavorite) {
            return "Избранное";
        } else if (playlist) {
            return playlist.name;
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
                ) : (
                    <section className="main-content">
                        <Chart 
                            title={titleTracklist} 
                            titleBtn="Смотреть все" 
                            hrefBtn="#" 
                            isFavorites={isFavorite}
                            playlistId={playlistId}
                            playlist={playlist}
                        />
                    </section>
                )}
                <Player/>
            </main>
        </PlayerProvider>
    )
}
export default TracksPage;