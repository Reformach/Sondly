import { Icon } from "@iconify/react";
import React from "react"; 

const NavigationPanel = () => {
    return (
        <nav className="navigation panels">
            <div className="navigation-header">
                <p>Разделы</p>
                <hr className="line-navigation-header"/>
            </div>
            <ul>
                <li>
                    <Icon icon="solar:home-2-outline" className="icon-navigation"/>
                    <a href="#" className="nav-link active" >Главное</a>
                </li>
                <li>
                    <Icon icon="flowbite:list-music-outline" className="icon-navigation"/>
                    <a href="#" className="nav-link">Плейлисты</a>
                </li>
                <li>
                    <Icon icon="solar:heart-outline" className="icon-navigation"/>
                    <a href="#" className="nav-link">Избранное</a>
                </li>
            </ul>
        </nav>
    );
  }
  
export default NavigationPanel;