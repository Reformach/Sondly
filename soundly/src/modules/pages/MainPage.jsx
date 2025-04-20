import LeftPanel from "../common components/LeftPanel";
import HeaderPage from "../common components/HeaderPage";
import DecorationPanel from "./main page components/DecorationPanel";
import PageSwitchingButtons from "../common components/PageSwitchingButtons";
import Chart from "./main page components/Chart";
import Playlist from "./main page components/Playlists";
import Statistics from "./main page components/Statistics";
import UploadTrack from "../common components/UploadTrack";
import Player from "../common components/Player";

import { UserContext } from '../context/UserContext';
import { PlayerProvider } from '../context/PlayerContext';
import React, { useContext, useState } from 'react';

const MainPage = () => {
    const { userData, setUserData } = useContext(UserContext);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const handleCreateAlbumClick = () => {
        setIsUploadModalOpen(true);
    };

    const handleCloseUploadModal = () => {
        setIsUploadModalOpen(false);
    };

    return (
        <PlayerProvider>
            <>
                <LeftPanel />
                <main className="content">
                    {userData.country ? (
                        <>
                            <HeaderPage />
                            <PageSwitchingButtons />
                            <DecorationPanel isExecutor={true} onCreateAlbumClick={handleCreateAlbumClick} />
                            {isUploadModalOpen && (
                            <UploadTrack onClose={handleCloseUploadModal} />
                            )}
                            <section className="main-content">
                                <Statistics />
                                <Playlist title={"Ваши альбомы"} titleBtn={"Показать больше"} hrefBtn={"/playlists"} />
                            </section>
                            <Player />
                        </>
                    ) : (
                        <>
                            <HeaderPage />
                            <PageSwitchingButtons />
                            <DecorationPanel isExecutor={false} />
                            <section className="main-content">
                                <Chart
                                    title={"Популярное сейчас"}
                                    titleBtn={"Показать больше"}
                                    hrefBtn={"/charts"}
                                    limit={5}
                                    isTopChart={true}
                                />
                                <Playlist isMain="playlist-main"/>
                            </section>
                            <Player />
                        </>
                    )}
                </main>
            </>
        </PlayerProvider>
    );
};

export default MainPage;