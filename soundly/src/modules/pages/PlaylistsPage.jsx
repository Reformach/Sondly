import LeftPanel from "../common components/LeftPanel";
import HeaderPage from "../common components/HeaderPage";
import PanelHeader from "../common components/PanelHeader";
import PageSwitchingButtons from "../common components/PageSwitchingButtons";
import Player from "../common components/Player";
import Playlists from "./main page components/Playlists";

const PlaylistsPage = ({description, titleTracklist}) =>{
    return(
        <>
        <LeftPanel/>
        <main className="content">
            <HeaderPage/>
            <PageSwitchingButtons/>
            <PanelHeader description={description}/>
            <section class="main-content">
                <Playlists/>
            </section>
            <Player/>
        </main>
        </>
    )
}
export default PlaylistsPage;