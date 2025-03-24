import { Link } from 'react-router-dom';


const PageSwitchingButtons = () => {
    return(
    <div class="header-buttons">
        <Link to="/">
            <button class="header-button">Главное</button>
        </Link>
        <Link to="/chart">
            <button class="header-button">Чарт</button>
        </Link>
        <Link to="/genres">
            <button class="header-button">Жанры</button>
        </Link>
    </div>  
    );
}
export default PageSwitchingButtons;