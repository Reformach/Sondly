import PlaylistStroke from "./PlaylistStroke";

const Playlists = ({title, titleBtn, hrefBtn}) => {
    return(
        <section class="playlists">
            <div className="chart-header">
                <h2>{title}</h2> 
                <a className={hrefBtn}>{titleBtn}</a>
            </div>
            <div className="line-header-chart"></div>
            <ul className="playlist-list">
                <PlaylistStroke/>
                <PlaylistStroke/>
            </ul>
        </section>
        
    ); 
}
export default Playlists;