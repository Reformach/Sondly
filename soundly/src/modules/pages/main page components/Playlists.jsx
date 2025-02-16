import PlaylistStroke from "./PlaylistStroke";

const Playlists = () => {
    return(
        <section class="playlists">
            <div className="playlist-header">
                <h2>Плейлисты</h2> 
                <button className="more-see">
                    <p className="more-see-text">Показать больше</p>
                </button>
            </div>
            <ul className="playlist-list">
                <PlaylistStroke/>
                <PlaylistStroke/>
            </ul>
        </section>
        
    );
   
}
export default Playlists;