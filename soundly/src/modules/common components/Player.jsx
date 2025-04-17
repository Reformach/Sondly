import React, { useEffect, useRef, useState, useContext } from 'react';
import PlayerButton from './player/PlayerButton';
import PlayerInfo from './player/PlayerInfo';
import PlayerSound from './player/PlayerSound';
import Equalizer from './Equalizer';
import { PlayerContext } from '../context/PlayerContext';
import { Icon } from '@iconify/react';
import axios from 'axios';

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
    const [showEqualizer, setShowEqualizer] = useState(false);
    const [eqSettings, setEqSettings] = useState({
        low: 0,
        mid: 0,
        high: 0
    });
    const [audioSetupComplete, setAudioSetupComplete] = useState(false);

    const audioRef = useRef(new Audio());
    const audioContextRef = useRef(null);
    const sourceNodeRef = useRef(null);
    const filtersRef = useRef({
        low: null,
        mid: null,
        high: null
    });

    // Добавим переменную для отслеживания первоначальной загрузки трека
    const currentTrackIdRef = useRef(null);

    // Добавляем новые состояния для отслеживания прослушиваний
    const playTimeThreshold = 5; // Порог в секундах для засчитывания прослушивания
    const playCountRecordedRef = useRef(false); // Флаг для отслеживания, было ли уже засчитано прослушивание

    const initAudioNodes = () => {
        if (!audioContextRef.current) {
            try {
                // Создаем новый аудиоконтекст
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                
                // Создаем фильтры для эквалайзера
                filtersRef.current = {
                    low: audioContextRef.current.createBiquadFilter(),
                    mid: audioContextRef.current.createBiquadFilter(),
                    high: audioContextRef.current.createBiquadFilter()
                };

                filtersRef.current.low.type = 'lowshelf';
                filtersRef.current.low.frequency.value = 150;
                filtersRef.current.low.gain.value = eqSettings.low;

                filtersRef.current.mid.type = 'peaking';
                filtersRef.current.mid.frequency.value = 1000;
                filtersRef.current.mid.Q.value = 1;
                filtersRef.current.mid.gain.value = eqSettings.mid;

                filtersRef.current.high.type = 'highshelf';
                filtersRef.current.high.frequency.value = 4000;
                filtersRef.current.high.gain.value = eqSettings.high;

                // Подключаем аудио элемент к Web Audio API
                sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
                
                // Подключаем все ноды
                sourceNodeRef.current.connect(filtersRef.current.low);
                filtersRef.current.low.connect(filtersRef.current.mid);
                filtersRef.current.mid.connect(filtersRef.current.high);
                filtersRef.current.high.connect(audioContextRef.current.destination);
                
                setAudioSetupComplete(true);
                console.log("Аудио контекст инициализирован успешно");
            } catch (error) {
                console.error("Ошибка при инициализации аудио контекста:", error);
            }
        }
    };

    useEffect(() => {
        const audio = audioRef.current;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            
            // Проверяем, если пользователь прослушал трек более 5 секунд и прослушивание еще не засчитано
            if (currentTrack && audio.currentTime >= playTimeThreshold && !playCountRecordedRef.current) {
                // Отмечаем, что прослушивание было засчитано
                playCountRecordedRef.current = true;
                
                // Отправляем запрос на увеличение счетчика прослушиваний
                incrementTrackPlayCount(currentTrack.id);
            }
        };
        
        const handleLoadedMetadata = () => setDuration(audio.duration);
        const handleEnded = () => {
            console.log("Трек завершен");
            nextTrack(); // Автоматически переходим к следующему треку
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        // Восстановление настроек эквалайзера из localStorage
        const savedEqSettings = localStorage.getItem('eqSettings');
        if (savedEqSettings) {
            setEqSettings(JSON.parse(savedEqSettings));
        }

        // Устанавливаем громкость
        audio.volume = volume / 100;

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [nextTrack, volume, currentTrack]);

    useEffect(() => {
        if (!currentTrack) return;

        // Сбрасываем флаг при смене трека
        playCountRecordedRef.current = false;

        // Инициализируем аудио контекст при первом взаимодействии
        const setupAudio = async () => {
            try {
                // Инициализируем аудио контекст при необходимости
                if (!audioSetupComplete) {
                    initAudioNodes();
                }
                
                const audio = audioRef.current;
                
                // Проверяем, изменился ли трек
                // Если трек тот же самый, не перезагружаем аудио
                const isNewTrack = currentTrackIdRef.current !== currentTrack.id;
                
                if (isNewTrack) {
                    // Сохраняем ID текущего трека для последующих сравнений
                    currentTrackIdRef.current = currentTrack.id;
                    
                    // Устанавливаем путь к файлу только если трек изменился
                    const fileUrl = currentTrack.file_path.startsWith('http') 
                        ? currentTrack.file_path 
                        : `http://localhost:4000/${currentTrack.file_path}`;
                    
                    console.log("Загрузка нового трека:", fileUrl);
                    
                    // Сохраняем текущую позицию воспроизведения
                    const savedCurrentTime = audio.currentTime;
                    
                    // Устанавливаем источник и загружаем новый трек
                    audio.src = fileUrl;
                    audio.crossOrigin = "anonymous"; // Важно для CORS
                    audio.load(); // Загружаем аудио
                    
                    // Сбрасываем позицию на начало для нового трека
                    setCurrentTime(0);
                }
                
                // Если нужно воспроизвести, пытаемся это сделать
                if (isPlaying) {
                    // Вначале проверяем и возобновляем аудио контекст если нужно
                    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                        await audioContextRef.current.resume();
                    }
                    
                    // Воспроизводим аудио с обработкой ошибок
                    try {
                        if (!audio.paused) return; // Если уже воспроизводится, ничего не делаем
                        
                        const playPromise = audio.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(error => {
                                console.error("Ошибка воспроизведения:", error);
                                // Если браузер не разрешает автовоспроизведение
                                if (error.name === 'NotAllowedError') {
                                    console.log("Автовоспроизведение заблокировано браузером. Потребуется взаимодействие пользователя.");
                                }
                            });
                        }
                    } catch (error) {
                        console.error("Ошибка при попытке воспроизведения:", error);
                    }
                }
            } catch (error) {
                console.error("Ошибка в setupAudio:", error);
            }
        };

        setupAudio();
    }, [currentTrack, isPlaying, audioSetupComplete]);

    // Этот эффект теперь будет отвечать ТОЛЬКО за переключение паузы/воспроизведения
    useEffect(() => {
        if (!currentTrack) return;

        const audio = audioRef.current;
        
        const controlPlayback = async () => {
            try {
                if (isPlaying) {
                    // Проверяем состояние аудио контекста
                    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                        await audioContextRef.current.resume();
                    }
                    
                    // Запускаем воспроизведение только если плеер на паузе
                    if (audio.paused) {
                        const playPromise = audio.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(error => {
                                console.error("Ошибка воспроизведения:", error);
                            });
                        }
                    }
                } else {
                    // Ставим на паузу только если плеер воспроизводится
                    if (!audio.paused) {
                        audio.pause();
                    }
                }
            } catch (err) {
                console.error("Playback control error:", err);
            }
        };

        controlPlayback();
    }, [isPlaying, currentTrack]);

    useEffect(() => {
        audioRef.current.volume = volume / 100;
    }, [volume]);

    const handleEqualizerChange = (band, value) => {
        const newValue = parseFloat(value);
        const newSettings = { ...eqSettings, [band]: newValue };

        setEqSettings(newSettings);
        localStorage.setItem('eqSettings', JSON.stringify(newSettings));

        if (filtersRef.current[band]) {
            filtersRef.current[band].gain.value = newValue;
        }
    };

    // Функция для увеличения счетчика прослушиваний трека
    const incrementTrackPlayCount = async (trackId) => {
        try {
            const response = await axios.post('http://localhost:4000/increment-track-plays', { trackId });
            console.log('Прослушивание засчитано:', response.data);
        } catch (error) {
            console.error('Ошибка при обновлении счетчика прослушиваний:', error);
        }
    };

    if (!currentTrack) {
        return null;
    }

    return (
        <div className="player">
            <PlayerInfo
                coverImage={currentTrack.album?.image_src || '/default-cover.jpg'}
                title={currentTrack.name || currentTrack.title || 'Неизвестный трек'}
                artist={currentTrack.album?.executor_name || currentTrack.album?.executor || 'Неизвестный исполнитель'}
            />

            <PlayerButton
                onPlayPause={togglePlayPause}
                onNext={nextTrack}
                onPrevious={previousTrack}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                onSeek={(newTime) => {
                    setCurrentTime(newTime);
                    audioRef.current.currentTime = newTime;
                }}
            />

            <PlayerSound volume={volume} onVolumeChange={setVolume} />

            <button
                onClick={() => setShowEqualizer(!showEqualizer)}
                className="equalizer-toggle"
            >
                <Icon icon={showEqualizer ? "mdi:chevron-up" : "mdi:equalizer"} />
                {showEqualizer ? 'Скрыть эквалайзер' : 'Эквалайзер'}
            </button>

            {showEqualizer && (
                <Equalizer
                    onChange={handleEqualizerChange}
                    initialValues={eqSettings}
                />
            )}
        </div>
    );
};

export default Player;