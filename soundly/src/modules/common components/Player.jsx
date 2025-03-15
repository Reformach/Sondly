import PlayerButton from "./player/PlayerButton";
import PlayerInfo from "./player/PlayerInfo";
import PlayerSound from "./player/PlayerSound";

const Player = () =>{
    return(
        <footer class="player">
            <PlayerInfo/>
            <PlayerButton/>
            <PlayerSound/>
        </footer>
    );
   
}
export default Player;