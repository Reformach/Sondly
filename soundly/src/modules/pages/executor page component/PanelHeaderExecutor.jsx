import React from 'react';

const PanelHeaderExecutor = ({ description, executor }) => {
    return (
        <div className="section-decoration">
            <div className="about-section executor-header">
                {executor ? (
                    <>
                        <div className="executor-avatar">
                            <img 
                                src={executor.avatar_url || "http://localhost:4000/users-avatars/default-avatar.png"} 
                                alt={executor.nickname || 'Исполнитель'} 
                                className="executor-avatar-img"
                            />
                        </div>
                        <div className="executor-info">
                            <h1 className="executor-name">{executor.nickname || 'Исполнитель'}</h1>
                            <p className="executor-bio">{executor.bio || 'Информация отсутствует'}</p>
                        </div>
                    </>
                ) : (
                    <>
            <img src="images/Music decoration.png" alt="music-decoration"/>
            <p>{description}</p>
                    </>
                )}
        </div>
    </div>
    );
};

export default PanelHeaderExecutor;