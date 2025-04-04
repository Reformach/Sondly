import { Icon } from "@iconify/react";

const Statistics = () => {
    return(
        <div className="stats-container">
        <div className="stat-circle">
          <Icon icon="ph:vinyl-record-light" width="200" height="200" />
          <div className="stat-value">1,234,567</div>
          <div className="stat-label">Прослушиваний</div>
        </div>
        <div className="stat-circle">
          <Icon icon="ph:vinyl-record-light" width="200" height="200" />
          <div className="stat-value">45</div>
          <div className="stat-label">Треков</div>
        </div>
        <div className="stat-circle">
          <Icon icon="ph:vinyl-record-light" width="200" height="200" />
          <div className="stat-value">7</div>
          <div className="stat-label">Альбомов</div>
        </div>
      </div>
    )
}
export default Statistics;