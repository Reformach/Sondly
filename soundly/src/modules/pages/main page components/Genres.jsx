import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import './Genres.css';

const Genres = ({ title = "Жанры", titleBtn = "Все жанры", hrefBtn = "/genres" }) => {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGenres = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:4000/get-genres');
                setGenres(response.data);
            } catch (error) {
                console.error('Ошибка при загрузке жанров:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGenres();
    }, []);

    // Простые иконки для разных жанров
    const getGenreIcon = (genreName) => {
        const lowerGenre = genreName.toLowerCase();
        
        if (lowerGenre.includes('рок')) return 'solar:guitar-linear';
        if (lowerGenre.includes('поп')) return 'solar:music-note-2-linear';
        if (lowerGenre.includes('рэп') || lowerGenre.includes('хип')) return 'solar:microphone-linear';
        if (lowerGenre.includes('джаз')) return 'solar:music-library-2-linear';
        if (lowerGenre.includes('электро')) return 'solar:equalizer-linear';
        if (lowerGenre.includes('класс')) return 'solar:piano-linear';
        
        // Дефолтная иконка для всех остальных жанров
        return 'solar:music-note-linear';
    };

    if (loading) {
        return <div className="loading-message">Загрузка жанров...</div>;
    }

    return (
        <section className="playlists genres-list-container">
            <div className="chart-header">
                <h2>{title}</h2>
                <Link to={hrefBtn} className="more-see-text">{titleBtn}</Link>
            </div>
            <div className="line-header-chart"></div>
            
            {genres.length > 0 ? (
                <ul className="playlist-list">
                    {genres.map(genre => (
                        <li key={genre.id} className="playlist-item">
                            <Link to={`/genre/${genre.id}`} className="playlist-link">
                            <div className="genre-icon">
                                <Icon icon={getGenreIcon(genre.name)} />
                            </div>
                            <div className="playlist-info">
                                <h3 className="playlist-name">{genre.name}</h3>
                                {genre.description && (
                                    <p className="playlist-description">{genre.description}</p>
                                )}
                            </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="empty-message">Жанры не найдены</div>
            )}
        </section>
    );
};

export default Genres; 