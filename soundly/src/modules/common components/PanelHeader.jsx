const PanelHeader = ({description}) => {
    return(
    <div class="section-decoration no-main">
        <div class="about-section">
            <p>{description}</p>
        </div>
        {/* <img className="image-decoration" src="images/Music decoration.png" alt="music-decoration"/> */}
    </div>
    );
}
export default PanelHeader;