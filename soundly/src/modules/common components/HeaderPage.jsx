import React, { useState, useEffect, useContext } from 'react';
import SearchPanel from "./SearchPanel";
import { Icon } from "@iconify/react";
import { UserContext } from '../context/UserContext';

const HeaderPage = () => {
    const { userData, logout } = useContext(UserContext);
    const [isPanelVisible, setIsPanelVisible] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const openPanel = () => {
        setIsPanelVisible(true);
    };

    const closePanel = () => {
        setIsPanelVisible(false);
    };

    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    const handleLogout = () => {
        logout();
        setIsUserMenuOpen(false);
        // Перезагрузка страницы или переход на главную
        window.location.href = '/';
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            closePanel();
            setIsUserMenuOpen(false);
        }
    };

    useEffect(() => {
        if (isPanelVisible || isUserMenuOpen) {
            window.addEventListener('keydown', handleKeyDown);
        } else {
            window.removeEventListener('keydown', handleKeyDown);
        }

        // Очистка обработчика при размонтировании компонента
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isPanelVisible, isUserMenuOpen]);


    return (
        <header className="header">
            <h1 className="app-name">Soundly</h1>
            <SearchPanel />
            <div className="header-buttons-container">
                <button className="button-about" onClick={openPanel}>
                    <Icon icon="solar:info-circle-linear" className="icon-navigation" />
                </button>
                
                {userData.id && (
                    <div className="user-menu-container">
                        <button className="user-button" onClick={toggleUserMenu}>
                            <Icon icon="solar:user-circle-linear" className="icon-navigation" />
                            {userData.nickname && <span className="user-name">{userData.nickname}</span>}
                        </button>
                        
                        {isUserMenuOpen && (
                            <div className="user-dropdown">
                                <button className="logout-button" onClick={handleLogout}>
                                    <Icon icon="solar:logout-3-linear" className="icon-logout" />
                                    Выйти
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isPanelVisible && (
                <div className="overlay" onClick={closePanel}>
                    <div className="info-panel" onClick={(e) => e.stopPropagation()}>
                        <button className="close-button" onClick={closePanel}>
                            <Icon icon="solar:close-circle-linear" className="icon-navigation" />
                        </button>
                        <p>Приложение сделано студентом ИСП-322</p>
                        <p>Автор: Илюшин Владислав</p>
                        <img src="images/College icon.png" alt="college icon" className="college-icon"></img>
                    </div>
                </div>
            )}
        </header>
    );
};

export default HeaderPage;
