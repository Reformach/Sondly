import { Icon } from "@iconify/react";
import React, { useContext, useEffect, useState } from "react"; 
import { Link, useLocation } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

const NavigationPanel = () => {
    const { userData, isAdmin } = useContext(UserContext);
    const location = useLocation();
    const [activePath, setActivePath] = useState(location.pathname);

    // Обновляем активный путь при изменении location
    useEffect(() => {
        setActivePath(location.pathname);
    }, [location]);

    // Проверяем, соответствует ли текущий путь указанному пути навигации
    const isPathActive = (navPath) => {
        if (navPath === '/') {
            return activePath === '/';
        }
        // Проверяем специальные случаи
        if (navPath === '/playlists' && (activePath === '/playlists' || activePath.startsWith('/playlist/'))) {
            return true;
        }
        if (navPath === '/genres' && (activePath === '/genres' || activePath.startsWith('/genre/'))) {
            return true;
        }
        if (navPath === '/favorite' && activePath === '/favorite') {
            return true;
        }
        if (navPath === '/admin' && activePath === '/admin') {
            return true;
        }
        return false;
    };

    return (
        <nav className="navigation panels">
            <div className="navigation-header">
                <p>Разделы</p>
                <hr className="line-navigation-header"/>
            </div>
            <ul>
            {userData.country ? (
                <>
                <li>
                    <Icon icon="solar:home-2-outline" className="icon-navigation"/>
                    <Link to="/" className={`nav-link ${isPathActive('/') ? 'active' : ''}`}>
                        Главное
                    </Link>
                </li>
                <li>
                    <Icon icon="solar:home-2-outline" className="icon-navigation"/>
                    <Link to="/" className="nav-link">Профиль</Link>
                </li>
                </>
            ):(
                <>
                    <li>
                        <Icon icon="solar:home-2-outline" className="icon-navigation"/>
                        <Link to="/" className={`nav-link ${isPathActive('/') ? 'active' : ''}`}>
                            Главное
                        </Link>
                    </li>
                    <li>
                        <Icon icon="flowbite:list-music-outline" className="icon-navigation"/>
                        <Link to="/playlists" className={`nav-link ${isPathActive('/playlists') ? 'active' : ''}`}>
                            Плейлисты
                        </Link>
                    </li>
                    <li>
                        <Icon icon="solar:music-note-2-bold" className="icon-navigation"/>
                        <Link to="/genres" className={`nav-link ${isPathActive('/genres') ? 'active' : ''}`}>
                            Жанры
                        </Link>
                    </li>
                    <li>
                        <Icon icon="solar:heart-outline" className="icon-navigation"/>
                        <Link to="/favorite" className={`nav-link ${isPathActive('/favorite') ? 'active' : ''}`}>
                            Избранное
                        </Link>
                    </li>
                    {isAdmin() && (
                        <li>
                            <Icon icon="solar:shield-user-outline" className="icon-navigation"/>
                            <Link to="/admin" className={`nav-link ${isPathActive('/admin') ? 'active' : ''}`}>
                                Управление
                            </Link>
                        </li>
                    )}
                </>
            )}
            </ul>
        </nav>
    );
};
  
export default NavigationPanel;