import LeftPanel from "../common components/LeftPanel";
import HeaderPage from "../common components/HeaderPage";
import DecorationPanel from "./main page components/DecorationPanel";
import PageSwitchingButtons from "../common components/PageSwitchingButtons";
import Chart from "./main page components/Chart";
import Playlist from "./main page components/Playlists";
import Player from "../common components/Player";

const MainPage = () => {
    return(
    <>
        <LeftPanel/>
        <main className="content">
            <HeaderPage/>
            <PageSwitchingButtons/>
            <DecorationPanel/>
            <section class="main-content">
                <Chart/>
                <Playlist/>
            </section>
            <Player/>
        </main>
    </>
    );
    
}
export default MainPage;