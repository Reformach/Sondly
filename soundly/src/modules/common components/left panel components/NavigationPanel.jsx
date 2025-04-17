import { Icon } from "@iconify/react";
import React ,{useContext} from "react"; 
import { Link } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

const NavigationPanel = () => {
    const { userData, setUserData } = useContext(UserContext);
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
                    <a href="/" className="nav-link active">Главное</a>
                </li>
                <li>
                    <Icon icon="solar:home-2-outline" className="icon-navigation"/>
                    <a href="/" className="nav-link">Профиль</a>
                </li>
                </>
            ):(
                <>
                    <li>
                        <Icon icon="solar:home-2-outline" className="icon-navigation"/>
                        <a href="/" className="nav-link active">Главное</a>
                    </li>
                    <li>
                        <Icon icon="flowbite:list-music-outline" className="icon-navigation"/>
                        <a href="/playlists" className="nav-link">Плейлисты</a>
                    </li>
                    <li>
                        <Icon icon="solar:music-note-2-bold" className="icon-navigation"/>
                        <a href="/genres" className="nav-link">Жанры</a>
                    </li>
                    <li>
                        <Icon icon="solar:heart-outline" className="icon-navigation"/>
                        <a href="/favorite" className="nav-link">Избранное</a>
                    </li>
                </>
            )}
            </ul>
            </nav>
    );
  }
  
export default NavigationPanel;