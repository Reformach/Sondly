import React, { createContext, useState, useRef } from 'react';

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null); // Текущий трек
    const [isPlaying, setIsPlaying] = useState(false); // Состояние воспроизведения
    const [tracks, setTracks] = useState([]); // Список всех треков
    
    // Отслеживаем последний воспроизведенный трек для предотвращения перезагрузки
    const lastTrackIdRef = useRef(null);

    // Функция для выбора трека
    const handleTrackSelect = (track) => {
        console.log("Selected track:", track);
        
        // Проверяем, нажали ли на тот же трек, который сейчас воспроизводится
        const isSameTrack = lastTrackIdRef.current === track.id;
        
        if (isSameTrack) {
            // Если тот же трек, просто переключаем воспроизведение/паузу
            setIsPlaying(!isPlaying);
        } else {
            // Если новый трек, устанавливаем его и начинаем воспроизведение
            lastTrackIdRef.current = track.id;
        setCurrentTrack(track);
        setIsPlaying(true); // Автоматически начинаем воспроизведение
        }
    };

    // Функция для остановки воспроизведения
    const handleStop = () => {
        setCurrentTrack(null);
        setIsPlaying(false);
        lastTrackIdRef.current = null;
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
            const nextTrackItem = tracks[nextIndex];
            
            lastTrackIdRef.current = nextTrackItem.id;
            setCurrentTrack(nextTrackItem);
            setIsPlaying(true);
        }
    };

    // Функция для перехода к предыдущему треку
    const previousTrack = () => {
        if (tracks.length > 0 && currentTrack) {
            const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
            const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
            const prevTrackItem = tracks[prevIndex];
            
            lastTrackIdRef.current = prevTrackItem.id;
            setCurrentTrack(prevTrackItem);
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