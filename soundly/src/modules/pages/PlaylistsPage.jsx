import LeftPanel from "../common components/LeftPanel";
import HeaderPage from "../common components/HeaderPage";
import PanelHeader from "../common components/PanelHeader";
import PageSwitchingButtons from "../common components/PageSwitchingButtons";
import Player from "../common components/Player";
import Playlists from "./main page components/Playlists";
import { PlayerProvider } from '../context/PlayerContext';

const PlaylistsPage = ({description, titleTracklist}) =>{
    return(
        <PlayerProvider>
            <>
                <LeftPanel/>
                <main className="content">
                    <HeaderPage/>
                    <PageSwitchingButtons/>
                    <PanelHeader description={description}/>
                    <section className="main-content">
                        <Playlists/>
                    </section>
                    <Player />
                </main>
            </>
        </PlayerProvider>
    )
}
export default PlaylistsPage;