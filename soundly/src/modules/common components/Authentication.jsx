import React, { useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import WelcomePanel from './WelcomePanel';

function Authentication({onClose}) {

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null); // ID пользователя

  const { setUserData } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = isLogin
      ? { email, password }
      : { email, nickname, password };

    try {
      const endpoint = isLogin ? '/login' : '/register';
      const response = await axios.post('http://localhost:4000' + endpoint, userData);

      if (response.status === 200 || response.status === 201) {
        console.log(isLogin ? 'Вход выполнен:' : 'Регистрация успешна:', response.data);
        setUserData(response.data);
        setUserId(response.data.id); // Сохраняем ID пользователя
        setIsAuthenticated(true);
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || 'Произошла ошибка');
      } else {
        setError('Ошибка сети. Пожалуйста, попробуйте позже.');
        console.log(error);
      }
    }
  };
  return (
    <div className="auth-modal-overlay">
      {isAuthenticated ? (
       <WelcomePanel onClose={onClose}/>
      ) : (
        <div className="auth-modal">
          <h1>Soundly</h1>
          <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
          {error && <p className="error-message">{error}</p>}
          <form className="form-authentication" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {!isLogin && (
              <input
                type="text"
                placeholder="Никнейм"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
            )}
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">{isLogin ? 'Войти' : 'Зарегистрироваться'}</button>
          </form>
          <p>
            {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
            <button onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </p>
        </div>
      )}
    </div>
  );
}

export default Authentication;