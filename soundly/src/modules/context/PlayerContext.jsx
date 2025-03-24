import React, { createContext, useState } from 'react';

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null); // Текущий трек
    const [isPlaying, setIsPlaying] = useState(false); // Состояние воспроизведения
    const [tracks, setTracks] = useState([]); // Список всех треков

    // Функция для выбора трека
    const handleTrackSelect = (track) => {
        console.log("Selected track:", track);
        setCurrentTrack(track);
        setIsPlaying(true); // Автоматически начинаем воспроизведение
    };

    // Функция для остановки воспроизведения
    const handleStop = () => {
        setCurrentTrack(null);
        setIsPlaying(false);
    };

    // Функция для переключения воспроизведения/паузы
    const togglePlayPause = () => {
        setIsPlaying((prev) => !prev);
    };

    // Функция для перехода к следующему треку
    const nextTrack = () => {
        if (tracks.length > 0 && currentTrack) {
            const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
            const nextIndex = (currentIndex + 1) % tracks.length;
            setCurrentTrack(tracks[nextIndex]);
            setIsPlaying(true);
        }
    };

    // Функция для перехода к предыдущему треку
    const previousTrack = () => {
        if (tracks.length > 0 && currentTrack) {
            const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
            const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
            setCurrentTrack(tracks[prevIndex]);
            setIsPlaying(true);
        }
    };

    return (
        <PlayerContext.Provider
            value={{
                currentTrack,
                isPlaying,
                handleTrackSelect,
                handleStop,
                togglePlayPause,
                nextTrack,
                previousTrack,
                setTracks, // Добавляем функцию для установки списка треков
            }}
        >
            {children}
        </PlayerContext.Provider>
    );
};