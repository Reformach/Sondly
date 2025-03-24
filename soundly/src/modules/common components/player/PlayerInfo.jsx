const PlayerInfo = ({ coverImage, title, artist }) => {
    return (
      <div className="player-info">
        <img src={coverImage} alt="music-cover" className="image-track-player"/>
        <span className="player-title">{title}</span>
        <span className="player-artist">{artist}</span>
      </div>
    );
  };
  
  export default PlayerInfo;