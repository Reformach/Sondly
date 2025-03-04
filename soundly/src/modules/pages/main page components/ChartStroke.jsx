import { Icon } from "@iconify/react";

const ChartStroke = () => {
    return(
        <li class="chart-stroke">
            <div class="name-and-description">
                <img src="images/Music label.png"/>
                <div class="description-container">
                    <span class="chart-title">Always you</span>
                    <span class="chart-artist">Men Singer</span>
                </div>
            </div>
            <div class="chart-interaction">
                <button class="play-music">
                    <Icon icon="solar:play-line-duotone" className="play-button-icon-chart"/>
                </button>
                <div class="like-and-time">
                    <button class="like-button">
                       <Icon icon="solar:heart-outline" className="like-button-icon"/>
                    </button>
                    <p>3:42</p>
                </div>
            </div>
           
        </li>
    );
}
export default ChartStroke;