import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import ChartStroke from './ChartStroke';
import { PlayerContext } from '../../context/PlayerContext';

const Chart = ({ title, titleBtn, hrefBtn }) => {
    const [albums, setAlbums] = useState([]);
    const { handleTrackSelect } = useContext(PlayerContext);

    // Получаем данные об альбомах и треках
    useEffect(() => {
        const fetchAlbumsAndTracks = async () => {
            try {
                const response = await axios.get('http://localhost:4000/get-albums-and-tracks');
                setAlbums(response.data);
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
            }
        };

        fetchAlbumsAndTracks();
    }, []);

    return (
        <section className="chart">
            <div className="chart-header">
                <h2>{title}</h2>
                <a href={hrefBtn} className="more-see-text">{titleBtn}</a>
            </div>
            <div className="line-header-chart"></div>
            <ol className="chart-list">
                {albums.map((album) =>
                    album.tracks.map((track) => (
                        <ChartStroke
                            key={track.id}
                            coverImage={album.image_src}
                            title={track.name}
                            artist={album.executor}
                            duration={track.duration}
                            onClick={() => handleTrackSelect({ ...track, album })}
                        />
                    ))
                )}
            </ol>
        </section>
    );
};

export default Chart;