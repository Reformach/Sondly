import React, { useState, useEffect } from 'react';
import SearchPanel from "./SearchPanel";
import { Icon } from "@iconify/react";

const HeaderPage = () => {
    const [isPanelVisible, setIsPanelVisible] = useState(false);

    const openPanel = () => {
        setIsPanelVisible(true);
    };

    const closePanel = () => {
        setIsPanelVisible(false);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            closePanel();
        }
    };

    useEffect(() => {
        if (isPanelVisible) {
            window.addEventListener('keydown', handleKeyDown);
        } else {
            window.removeEventListener('keydown', handleKeyDown);
        }

        // Очистка обработчика при размонтировании компонента
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isPanelVisible]);


    return (
        <header className="header">
            <h1 className="app-name">Soundly</h1>
            <SearchPanel />
            <button className="button-about" onClick={openPanel}>
                <Icon icon="solar:info-circle-linear" className="icon-navigation" />
            </button>

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
