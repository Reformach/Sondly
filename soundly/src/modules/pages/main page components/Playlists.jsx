import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import PlaylistStroke from "./PlaylistStroke";
import AddPlaylistButton from './AddPlaylistButton';
import { UserContext } from '../../context/UserContext';

const Playlists = ({title = "Плейлисты", titleBtn = "Смотреть все", hrefBtn = "/playlists", isMain = ""}) => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const { userData } = useContext(UserContext);
    
    const loadPlaylists = async () => {
        if (!userData.id) {
            setPlaylists([]);
            setLoading(false);
            return;
        }
        
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:4000/get-user-playlists', {
                params: { userId: userData.id }
            });
            setPlaylists(response.data.filter(playlist => !playlist.isFavorites));
        } catch (error) {
            console.error('Ошибка при загрузке плейлистов:', error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        loadPlaylists();
    }, [userData.id]);
    
    return(
        <section className={`playlists ${isMain}`}>
            <div className="chart-header">
                <h2>{title}</h2> 
                <a href={hrefBtn} className="more-see-text">{titleBtn}</a>
            </div>
            <div className="line-header-chart"></div>
            {loading ? (
                <div className="loading-message">Загрузка...</div>
            ) : (
                <ul className="playlist-list">
                    {playlists.map(playlist => (
                        <PlaylistStroke 
                            key={playlist.id}
                            id={playlist.id}
                            name={playlist.name}
                            description={playlist.description}
                            tracks={playlist.tracks || []}
                        />
                    ))}
                    <AddPlaylistButton onPlaylistAdded={loadPlaylists} />
                </ul>
            )}
        </section>
    ); 
}

export default Playlists;