import React, { useState, useContext, useRef } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import '../css files/uploadTracks.css';
import { Icon } from '@iconify/react';

const UploadTrack = ({ onClose }) => {
  const [albumName, setAlbumName] = useState('');
  const [genre, setGenre] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [tracks, setTracks] = useState([{ name: '', file: null, preview: null }]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { userData } = useContext(UserContext);
  const fileInputRef = useRef(null);
  const audioInputRefs = useRef([]);

  // Обработчик для обложки альбома
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setError('Пожалуйста, выберите файл изображения');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Размер обложки не должен превышать 5MB');
      return;
    }

    setError('');
    setCoverImage(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const clearCoverPreview = () => {
    setCoverPreview(null);
    setCoverImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Обработчики для треков
  const addTrack = () => {
    setTracks([...tracks, { name: '', file: null, preview: null }]);
  };

  const updateTrack = (index, field, value) => {
    const updatedTracks = [...tracks];
    updatedTracks[index][field] = value;
    setTracks(updatedTracks);
  };

  const handleTrackFileChange = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('audio.*')) {
      setError('Пожалуйста, выберите аудиофайл');
      return;
    }

    setError('');
    updateTrack(index, 'file', file);
    updateTrack(index, 'preview', file.name);
  };

  const removeTrack = (index) => {
    const updatedTracks = tracks.filter((_, i) => i !== index);
    setTracks(updatedTracks);
    audioInputRefs.current = audioInputRefs.current.filter((_, i) => i !== index);
  };

  const clearTrackFile = (index) => {
    updateTrack(index, 'file', null);
    updateTrack(index, 'preview', null);
    if (audioInputRefs.current[index]) {
      audioInputRefs.current[index].value = '';
    }
  };

  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!coverImage) {
      setError('Пожалуйста, загрузите обложку альбома');
      return;
    }

    if (tracks.some(track => !track.name || !track.file)) {
      setError('Пожалуйста, заполните все поля для треков');
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('executorId', userData.id);
    formData.append('albumName', albumName);
    formData.append('genre', genre);
    formData.append('coverImage', coverImage);

    tracks.forEach((track, index) => {
      formData.append('tracks', track.file);
      formData.append(`trackNames[${index}]`, track.name);
    });
  
    try {
      await axios.post('http://localhost:4000/upload-tracks', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onClose();
    } catch (error) {
      console.error('Ошибка при загрузке альбома:', error);
      setError('Ошибка при загрузке альбома. Пожалуйста, попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="upload-modal-overlay">
      <div className="upload-track-modal">
        <button onClick={onClose} className="close-button">
          <Icon icon="mdi:close" />
        </button>
        <h2>Загрузка нового альбома</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Блок информации об альбоме */}
          <div className="album-info-section">
            <div className="form-group">
              <label>Название альбома:</label>
              <input
                type="text"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Жанр альбома:</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Обложка альбома:</label>
              
              {coverPreview ? (
                <div className="cover-preview-container">
                  <img 
                    src={coverPreview} 
                    alt="Предпросмотр обложки" 
                    className="cover-preview"
                  />
                  <div className="cover-preview-actions">
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="change-cover-button"
                    >
                      <Icon icon="mdi:image-edit" />
                    </button>
                    <button 
                      type="button" 
                      onClick={clearCoverPreview}
                      className="clear-cover-button"
                    >
                      <Icon icon="mdi:trash-can-outline" />
                    </button>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                  />
                </div>
              ) : (
                <div className="cover-upload-area" onClick={() => fileInputRef.current?.click()}>
                  <Icon icon="mdi:image-plus" className="upload-icon" />
                  <span>Загрузить обложку</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Блок треков */}
          <div className="tracks-section">
            <h3>Треки:</h3>
            
            {tracks.map((track, index) => (
              <div key={index} className="track-item">
                <div className="track-info">
                  <div className="form-group">
                    <label>Название трека {index + 1}:</label>
                    <input
                      type="text"
                      value={track.name}
                      onChange={(e) => updateTrack(index, 'name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Аудиофайл:</label>
                    {track.preview ? (
                      <div className="audio-preview">
                        <span>{track.preview}</span>
                        <div className="audio-preview-actions">
                          <button 
                            type="button" 
                            onClick={() => audioInputRefs.current[index]?.click()}
                            className="change-audio-button"
                          >
                            <Icon icon="mdi:pencil" />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => clearTrackFile(index)}
                            className="clear-audio-button"
                          >
                            <Icon icon="mdi:trash-can-outline" />
                          </button>
                        </div>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => handleTrackFileChange(index, e)}
                          ref={el => audioInputRefs.current[index] = el}
                          style={{ display: 'none' }}
                        />
                      </div>
                    ) : (
                      <div 
                        className="audio-upload-area" 
                        onClick={() => audioInputRefs.current[index]?.click()}
                      >
                        <Icon icon="mdi:music-box-outline" className="upload-icon" />
                        <span>Загрузить аудиофайл</span>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => handleTrackFileChange(index, e)}
                          ref={el => audioInputRefs.current[index] = el}
                          style={{ display: 'none' }}
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>

                {tracks.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeTrack(index)}
                    className="remove-track-button"
                  >
                    <Icon icon="mdi:minus-circle-outline" />
                  </button>
                )}
              </div>
            ))}

            <button type="button" onClick={addTrack} className="add-track-button">
              <Icon icon="mdi:plus-circle-outline" />
              Добавить трек
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Отмена
            </button>
            <button type="submit" disabled={isLoading} className="submit-button">
              {isLoading ? (
                <>
                  <Icon icon="mdi:loading" className="loading-icon" />
                  Загрузка...
                </>
              ) : (
                'Загрузить альбом'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadTrack;