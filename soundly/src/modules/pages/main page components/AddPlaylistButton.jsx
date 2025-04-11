import React, { useState, useContext } from 'react';
import { Icon } from '@iconify/react';
import { UserContext } from '../../context/UserContext';
import axios from 'axios';

const AddPlaylistButton = ({ onPlaylistAdded }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [playlistName, setPlaylistName] = useState('');
    const [playlistDescription, setPlaylistDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { userData } = useContext(UserContext);
    
    const openModal = () => {
        if (!userData.id) {
            alert('Пожалуйста, войдите в аккаунт, чтобы создавать плейлисты');
            return;
        }
        setIsModalOpen(true);
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setPlaylistName('');
        setPlaylistDescription('');
        setError('');
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!playlistName.trim()) {
            setError('Название плейлиста не может быть пустым');
            return;
        }
        
        setIsLoading(true);
        setError('');
        
        try {
            const response = await axios.post('http://localhost:4000/create-playlist', {
                userId: userData.id,
                name: playlistName,
                description: playlistDescription,
                isFavorites: false
            });
            
            if (response.status === 201) {
                closeModal();
                if (onPlaylistAdded) {
                    onPlaylistAdded();
                }
            }
        } catch (error) {
            console.error('Ошибка при создании плейлиста:', error);
            setError(error.response?.data?.message || 'Произошла ошибка при создании плейлиста');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <>
            <li className="playlist-item add-playlist" onClick={openModal}>
                <div className="playlist-content add-playlist-content">
                    <Icon icon="solar:add-circle-linear" className="add-playlist-icon" />
                    <h3 className="playlist-name">Создать плейлист</h3>
                </div>
            </li>
            
            {isModalOpen && (
                <div className="overlay" onClick={closeModal}>
                    <div className="modal-create-playlist" onClick={(e) => e.stopPropagation()}>
                        <button className="close-button" onClick={closeModal}>
                            <Icon icon="solar:close-circle-linear" />
                        </button>
                        
                        <h2>Создать новый плейлист</h2>
                        
                        {error && <p className="error-message">{error}</p>}
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-field">
                                <label htmlFor="playlist-name">Название</label>
                                <input
                                    id="playlist-name"
                                    type="text"
                                    value={playlistName}
                                    onChange={(e) => setPlaylistName(e.target.value)}
                                    placeholder="Название плейлиста"
                                    required
                                />
                            </div>
                            
                            <div className="form-field">
                                <label htmlFor="playlist-description">Описание (необязательно)</label>
                                <textarea
                                    id="playlist-description"
                                    value={playlistDescription}
                                    onChange={(e) => setPlaylistDescription(e.target.value)}
                                    placeholder="Описание плейлиста"
                                    rows="3"
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                className="create-playlist-btn" 
                                disabled={isLoading}
                            >
                                {isLoading ? 'Создание...' : 'Создать плейлист'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AddPlaylistButton; 