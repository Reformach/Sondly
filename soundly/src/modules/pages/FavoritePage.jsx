import LeftPanel from "../common components/LeftPanel";
import HeaderPage from "../common components/HeaderPage";
import DecorationPanel from "./main page components/DecorationPanel";
import PageSwitchingButtons from "../common components/PageSwitchingButtons";
import Player from "../common components/Player";

const FavoritePage = () =>{
    return(
        <>
        <LeftPanel/>
        <main className="content">
            <HeaderPage/>
            <PageSwitchingButtons/>
            <DecorationPanel/>
            <section class="main-content">
            </section>
            <Player/>
        </main>
        </>
    )
}
export default FavoritePage;