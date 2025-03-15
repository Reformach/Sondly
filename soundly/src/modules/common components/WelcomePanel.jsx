import { Icon } from '@iconify/react';
import { useEffect } from 'react';
import '../css files/welcomePanel.css'

function WelcomePanel({onClose}) {
    useEffect(() => {
        const timer = setTimeout(() => {
          onClose(); // Закрываем окно приветствия
        }, 3000); // 3000 мс = 3 секунды
    
        return () => clearTimeout(timer); // Очищаем таймер при размонтировании компонента
      }, [onClose]);
    
    return (
    <div className="welcome-panel">
      <h2>Добро пожаловать в Soundly!</h2>
      <p>Вы успешно вошли в систему.</p>

      {/* Анимированные ноты */}
      <div className="notes-container">
        <Icon icon="clarity:music-note-solid" className="note note-1" />
        <Icon icon="clarity:music-note-solid" className="note note-2" />
        <Icon icon="clarity:music-note-solid" className="note note-3" />
        <Icon icon="clarity:music-note-solid" className="note note-4" />
        <Icon icon="clarity:music-note-solid" className="note note-5" />
      </div>
    </div>
  );
}
export default WelcomePanel;