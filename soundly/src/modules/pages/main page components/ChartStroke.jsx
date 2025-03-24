import { Icon } from '@iconify/react';

const ChartStroke = ({ coverImage, title, artist, duration, onClick }) => {
    return (
        <li className="chart-stroke">
            <div className="name-and-description">
                <img src={coverImage} alt="Обложка альбома" className='image-track'/>
                <div className="description-container">
                    <span className="chart-title">{title}</span>
                    <span className="chart-artist">{artist}</span>
                </div>
            </div>
            <div className="chart-interaction">
                <button className="play-music" onClick={onClick}>
                    <Icon icon="solar:play-line-duotone" className="play-button-icon-chart" />
                </button>
                <div className="like-and-time">
                    <button className="like-button">
                        <Icon icon="solar:heart-outline" className="like-button-icon" />
                    </button>
                    <p>{duration}</p>
                </div>
            </div>
        </li>
    );
};

export default ChartStroke;