import React, { useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import UploadAvatar from '../UploadAvatar';
import { Icon } from '@iconify/react';
import '../../css files/uploadImage.css';

const AccountCard = () => {
  const { userData, setUserData } = useContext(UserContext);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const handleAvatarClick = () => {
    setIsUploadModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Создаем превью для изображения
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
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

      setUserData((prevData) => ({
        ...prevData,
        avatar: response.data.avatar,
      }));

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
        <UploadAvatar 
          handleUpload={handleUpload} 
          handleFileChange={handleFileChange} 
          closeModal={() => setIsUploadModalOpen(false)}
          previewImage={previewImage}
        />
      )}
    </div>
  );
};

export default AccountCard;