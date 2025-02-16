import React, { useState, useEffect } from 'react';
import { Icon } from "@iconify/react";

const PlayerSound = () =>{
    
    const [volume, setVolume] = useState(50); // Уровень громкости от 0 до 100
    const [isVisible, setIsVisible] = useState(false);

    const handleVolumeChange = (event) => {
        setVolume(event.target.value);
        setIsVisible(true);
    };

    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 1000);
            return () => clearTimeout(timer); // Очистка таймера при размонтировании или изменении состояния
        }
    }, [isVisible]);


    return(
        <div className="sound-container">
            <div className="sound-slider">
                {volume===0 ?(
                        <Icon icon="solar:volume-cross-linear" className="icon-navigation"/>
                    ):(
                        <Icon icon="solar:volume-loud-linear" className="icon-navigation"/>  
                    )
                }
                <input type="range" id="volume" min="0" max="100" value={volume} onChange={handleVolumeChange} className="slider"/>
            </div>
            {isVisible && (
                <div className="volume-popup">
                    {volume}
                </div>
            )}
        </div>
        
    );
   
}
export default PlayerSound;