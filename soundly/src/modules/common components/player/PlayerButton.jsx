import { Icon } from "@iconify/react";

const PlayerButton = ({ 
  onPlayPause, 
  onNext, 
  onPrevious, 
  isPlaying, 
  currentTime, 
  duration, 
  onSeek 
}) => {
  // Функция для форматирования времени
  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="player-controls">
      <div className="buttons-player">
        <button className="player-button" onClick={onPrevious}>
          <Icon icon="solar:skip-previous-linear" className="icon-navigation" />
        </button>
        <button className="player-button" onClick={onPlayPause}>
          {isPlaying ? (
            <Icon icon="solar:pause-linear" className="icon-navigation" />
          ) : (
            <Icon icon="solar:play-linear" className="icon-navigation" />
          )}
        </button>
        <button className="player-button" onClick={onNext}>
          <Icon icon="solar:skip-next-outline" className="icon-navigation" />
        </button>
      </div>
      <div className="progress-container">
        <span>{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          step="0.1"
          className="progress-bar"
        />
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default PlayerButton;