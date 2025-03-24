import React, { useEffect, useRef, useState, useContext } from 'react';
import PlayerButton from './player/PlayerButton';
import PlayerInfo from './player/PlayerInfo';
import PlayerSound from './player/PlayerSound';
import { PlayerContext } from '../context/PlayerContext';

const Player = () => {
    const {
        currentTrack,
        isPlaying,
        togglePlayPause,
        handleStop,
        nextTrack,
        previousTrack,
    } = useContext(PlayerContext);
    
    const [volume, setVolume] = useState(50);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    
    const audioRef = useRef(null);

    // Загружаем новый трек только при его смене
    useEffect(() => {
        if (audioRef.current && currentTrack) {
            audioRef.current.src = currentTrack.file_path;
            audioRef.current.load();
            audioRef.current.play();
        }
    }, [currentTrack]);

    // Управляем воспроизведением
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play();
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying]);

    // Устанавливаем громкость
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
    }, [volume]);

    // Обновление текущего времени трека
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            const updateTime = () => {
                setCurrentTime(audio.currentTime);
            };
            audio.addEventListener('timeupdate', updateTime);
            return () => {
                audio.removeEventListener('timeupdate', updateTime);
            };
        }
    }, []);

    // Получение продолжительности трека
    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    // Обработчик перемотки
    const handleSeek = (e) => {
        const newTime = e.target.value;
        setCurrentTime(newTime);
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
        }
    };

    // Форматирование времени в "минуты:секунды"
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    if (!currentTrack) {
        return null;
    }

    return (
        <div className="player">
            <PlayerInfo
                coverImage={currentTrack.album.image_src}
                title={currentTrack.name}
                artist={currentTrack.album.executor}
            />

            <PlayerButton
                onPlayPause={togglePlayPause}
                onNext={nextTrack}
                onPrevious={previousTrack}
                isPlaying={isPlaying}
            />

            {/* Прогресс-бар */}
            <div className="progress-container">
                <span>{formatTime(currentTime)}</span>
                <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={handleSeek}
                />
                <span>{formatTime(duration)}</span>
            </div>

            <PlayerSound volume={volume} onVolumeChange={setVolume} />

            <audio 
                ref={audioRef} 
                onEnded={handleStop} 
                onLoadedMetadata={handleLoadedMetadata} 
            />
        </div>
    );
};

export default Player;