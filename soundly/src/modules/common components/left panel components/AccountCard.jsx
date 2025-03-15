// src/components/AccountCard.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import '../../css files/uploadImage.css';

const AccountCard = () => {
  const { userData, setUserData } = useContext(UserContext); // Используем контекст
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleAvatarClick = () => {
    setIsUploadModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('avatar', selectedFile);
    formData.append('userId', userData.id);

    try {
      const response = await axios.post('http://localhost:4000/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Аватар загружен:', response.data);

      // Обновляем аватарку в контексте
      setUserData((prevData) => ({
        ...prevData,
        avatar: response.data.avatar,
      }));

      // Закрываем окно загрузки
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error('Ошибка при загрузке аватарки:', error);
    }
  };

  return (
    <div className="profile panels">
      <img
        src={userData.avatar}
        alt="Профиль"
        className="profile-icon"
        onClick={handleAvatarClick}
      />
      <span className="profile-name">{userData.nickname}</span>

      {isUploadModalOpen && (
        <div className="upload-modal">
          <h3>Загрузите новую аватарку</h3>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <button onClick={handleUpload}>Загрузить</button>
          <button onClick={() => setIsUploadModalOpen(false)}>Отмена</button>
        </div>
      )}
    </div>
  );
};

export default AccountCard;