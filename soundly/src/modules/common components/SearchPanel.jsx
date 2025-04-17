import React, { useState, useEffect, useContext } from 'react';
import { Icon } from "@iconify/react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PlayerContext } from '../context/PlayerContext';

const SearchPanel = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const navigate = useNavigate();
    const playerContext = useContext(PlayerContext);
    
    // Безопасно получаем функции из контекста
    const handleTrackSelect = playerContext?.handleTrackSelect;
    const setTracksToContext = playerContext?.setTracks;

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        try {
            const response = await axios.get(`http://localhost:4000/search-tracks?query=${searchQuery}`);
            setSearchResults(response.data);
            setShowResults(true);
        } catch (error) {
            console.error('Ошибка при поиске треков:', error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleResultClick = (track) => {
        if (playerContext) {
            // Устанавливаем список треков в контекст плеера, если контекст доступен
            if (setTracksToContext) {
                setTracksToContext(searchResults);
            }
            
            // Воспроизводим выбранный трек, если функция доступна
            if (handleTrackSelect) {
                handleTrackSelect(track);
            }
        } else {
            console.warn('Контекст плеера недоступен. Воспроизведение невозможно.');
            // Можно добавить перенаправление на страницу, где доступен плеер
        }
        
        // Скрываем результаты поиска
        setShowResults(false);
    };

    // Закрыть результаты при клике вне компонента
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.search')) {
                setShowResults(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <div className="search">
            <input 
                type="text" 
                placeholder="Поиск музыки" 
                className="search-input"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
            />
            <button className="search-button" onClick={handleSearch}>
                <Icon icon="solar:magnifer-linear" className="search-icon" />
            </button>

            {showResults && searchResults.length > 0 && (
                <div className="search-results">
                    {searchResults.map((track) => (
                        <div 
                            key={track.id} 
                            className="search-result-item"
                            onClick={() => handleResultClick(track)}
                        >
                            <div className="result-image">
                                <img src={track.album?.image_src || 'placeholder.jpg'} alt={track.name} />
                            </div>
                            <div className="result-info">
                                <div className="result-title">{track.name}</div>
                                <div className="result-artist">{track.album?.executor_name}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {showResults && searchResults.length === 0 && (
                <div className="search-results">
                    <div className="no-results">
                        Треки не найдены
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchPanel;