import LeftPanel from "../common components/LeftPanel";
import HeaderPage from "../common components/HeaderPage";
import PanelHeader from "../common components/PanelHeader";
import PageSwitchingButtons from "../common components/PageSwitchingButtons";
import Player from "../common components/Player";
import Chart from "./main page components/Chart";

const TracksPage = ({description, titleTracklist, titleBtn, hrefBtn}) =>{
    return(
        <>
        <LeftPanel/>
        <main className="content">
            <HeaderPage/>
            <PageSwitchingButtons/>
            <PanelHeader description={description}/>
            <section class="main-content">
                <Chart title={titleTracklist} titleBtn={titleBtn} hrefBtn={hrefBtn}/>
            </section>
            <Player/>
        </main>
        </>
    )
}
export default TracksPage;