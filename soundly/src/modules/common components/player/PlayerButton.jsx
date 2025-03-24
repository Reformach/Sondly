import { Icon } from "@iconify/react";

const PlayerButton = ({ onPlayPause, onNext, onPrevious, isPlaying }) => {
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
    </div>
  );
};

export default PlayerButton;