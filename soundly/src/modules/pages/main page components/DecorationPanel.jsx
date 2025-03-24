const DecorationPanel = ({isExecutor, onCreateAlbumClick}) => {
    return(
    <div class="section-decoration">
        <div class="about-section">
            {isExecutor ? (
                <>
                <p>Ваша музыка - настоящее<br/>
                искусство, поделитесь ею с другими!</p>
                </>
            ) : (
                <>
                 <p>Слушай музыку<br/>
                 и наслаждайся</p>
                </>
            )}
            {isExecutor ? (
                <button className="header-button create-album" onClick={onCreateAlbumClick}>Создать альбом</button>
            ) : (
               <>
                <a href="" class="telegram"></a>
                <a href="" class="vk"></a>
               </> 
            )}  
        </div>
        <img className="image-decoration" src="images/Music decoration.png" alt="music-decoration"/>
    </div>
    );
}
export default DecorationPanel;