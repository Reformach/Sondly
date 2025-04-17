import LeftPanel from "../common components/LeftPanel";
import HeaderPage from "../common components/HeaderPage";
import PanelHeader from "../common components/PanelHeader";
import PageSwitchingButtons from "../common components/PageSwitchingButtons";
import Player from "../common components/Player";
import Genres from "./main page components/Genres";
import { PlayerProvider } from '../context/PlayerContext';

const GenresPage = ({ description = "Жанры музыки" }) => {
    return (
        <PlayerProvider>
            <>
                <LeftPanel />
                <main className="content">
                    <HeaderPage />
                    <PageSwitchingButtons />
                    <PanelHeader description={description} />
                    <section className="main-content">
                        <Genres />
                    </section>
                    <Player />
                </main>
            </>
        </PlayerProvider>
    );
};

export default GenresPage; 