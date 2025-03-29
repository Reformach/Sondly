import React, { useEffect, useRef, useState, useContext } from 'react';
import PlayerButton from './player/PlayerButton';
import PlayerInfo from './player/PlayerInfo';
import PlayerSound from './player/PlayerSound';
import Equalizer from './Equalizer';
import { PlayerContext } from '../context/PlayerContext';
import { Icon } from '@iconify/react';

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

    const audioRef = useRef(new Audio());
    const audioContextRef = useRef(null);
    const sourceNodeRef = useRef(null);
    const filtersRef = useRef({
        low: null,
        mid: null,
        high: null
    });

    const initAudioNodes = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();

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

            sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
            sourceNodeRef.current.connect(filtersRef.current.low);
            filtersRef.current.low.connect(filtersRef.current.mid);
            filtersRef.current.mid.connect(filtersRef.current.high);
            filtersRef.current.high.connect(audioContextRef.current.destination);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleLoadedMetadata = () => setDuration(audio.duration);

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleStop);

        // Восстановление настроек эквалайзера из localStorage
        const savedEqSettings = localStorage.getItem('eqSettings');
        if (savedEqSettings) {
            setEqSettings(JSON.parse(savedEqSettings));
        }

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleStop);
        };
    }, [handleStop]);

    useEffect(() => {
        if (!currentTrack) return;

        const audio = audioRef.current;
        audio.src = currentTrack.file_path;
        audio.load();

        const playAudio = async () => {
            try {
                initAudioNodes();
                await audio.play();
            } catch (err) {
                console.error("Playback error:", err);
            }
        };

        if (isPlaying) {
            playAudio();
        }
    }, [currentTrack]);

    useEffect(() => {
        if (!currentTrack) return;

        const audio = audioRef.current;
        const controlPlayback = async () => {
            try {
                if (isPlaying) {
                    if (audioContextRef.current?.state === 'suspended') {
                        await audioContextRef.current.resume();
                    }
                    await audio.play();
                } else {
                    audio.pause();
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