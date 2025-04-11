import React from 'react';
import { Link } from 'react-router-dom';

const PlaylistStroke = ({ id, name, description, tracks }) => {
    return(
        <li className="playlist-item">
            <Link to={`/playlist/${id}`} className="playlist-link">
                <div className="playlist-content">
                    <h3 className="playlist-name">{name || '#Mix'}</h3>
                    <p className="playlist-description">
                        {description || `${tracks?.length || 0} треков`}
                    </p>
                </div>
            </Link>
        </li>
    );
}

export default PlaylistStroke;