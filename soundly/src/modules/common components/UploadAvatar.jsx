import React from 'react';
import { Icon } from '@iconify/react';
import '../css files/uploadImage.css';

const UploadAvatar = ({ handleUpload, handleFileChange, closeModal, previewImage }) => {
    const fileInputRef = React.useRef(null);

    const handleClick = () => {
        fileInputRef.current.click();
    };

    const clearPreview = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        handleFileChange({ target: { files: [] } });
    };

    return (
        <div className="upload-modal-overlay">
            <div className="upload-avatar-modal">
                <button onClick={closeModal} className="close-button">
                    <Icon icon="mdi:close" />
                </button>
                <h2>Загрузка новой аватарки</h2>
                
                <form onSubmit={handleUpload}>
                    <div className="avatar-upload-section">
                        {previewImage ? (
                            <div className="avatar-preview-container">
                                <img 
                                    src={previewImage} 
                                    alt="Предпросмотр аватарки" 
                                    className="avatar-preview"
                                />
                                <div className="avatar-actions">
                                    <button 
                                        type="button" 
                                        onClick={handleClick}
                                        className="change-avatar-button"
                                    >
                                        <Icon icon="mdi:image-edit" />
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={clearPreview}
                                        className="clear-avatar-button"
                                    >
                                        <Icon icon="mdi:trash-can-outline" />
                                    </button>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    required
                                />
                            </div>
                        ) : (
                            <div className="avatar-upload-area" onClick={handleClick}>
                                <Icon icon="mdi:image-plus" className="upload-icon" />
                                <span>Выберите изображение</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    required
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={closeModal} className="cancel-button">
                            Отмена
                        </button>
                        <button type="submit" className="submit-button">
                            Сохранить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadAvatar;