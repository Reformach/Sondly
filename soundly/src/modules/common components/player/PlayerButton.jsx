import { Icon } from "@iconify/react";

const PlayerButton = () =>{
    return(
    <div class="player-controls">
        <div className="buttons-player">
            <button class="player-button">
                <Icon icon="solar:skip-previous-linear" className="icon-navigation"/>
            </button>
            <button class="player-button">
                <Icon icon="solar:play-linear" className="icon-navigation"/>
                {/* <Icon icon="solar:pause-linear" className="icon-navigation"/> */}
            </button>
            <button class="player-button">
                <Icon icon="solar:skip-next-outline" className="icon-navigation"/>
            </button>
        </div>
        <div class="player-progress">
            <input type="range" id="volume" min="0" max="100" value={100} className="slider"/>
        </div>
    </div>
    );
   
}
export default PlayerButton;