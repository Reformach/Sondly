const express = require('express');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, updateDoc, getDoc, addDoc, Timestamp, arrayUnion, arrayRemove, serverTimestamp } = require('firebase/firestore');
const upload = require('./multerConfig');
const path = require('path');
const fs = require('fs');


// Инициализация Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// Инициализация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBTwURfxdrp8uPvCl34I1dT8ZlbLG9N9tU",
  authDomain: "soundly-5e6ce.firebaseapp.com",
  projectId: "soundly-5e6ce",
  storageBucket: "soundly-5e6ce.firebasestorage.app",
  messagingSenderId: "397479114530",
  appId: "1:397479114530:web:743657a48b6b70afcf977b",
  measurementId: "G-FNE9GR9YJB"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Отдача статических файлов из папки public
app.use('/album-covers', express.static(path.join(__dirname, '../soundly/public/album-covers')));
app.use('/tracks', express.static(path.join(__dirname, '../soundly/public/tracks')));
app.use('/users-avatars', express.static(path.join(__dirname, '../soundly/public/users-avatars')));
console.log('Пути к статическим файлам:');
console.log('Album covers:', path.join(__dirname, '../soundly/public/album-covers'));
console.log('Tracks:', path.join(__dirname, '../soundly/public/tracks'));
console.log('User avatars:', path.join(__dirname, '../soundly/public/users-avatars'));

// Регистрация пользователя
app.post('/register', async (req, res) => {
  const { email, nickname, password, country, isExecutor} = req.body;

  try {
    // Проверка, существует ли пользователь с таким email
    let usersCollection = null
    if(isExecutor)
      usersCollection = collection(db, "executors");
    else
      usersCollection = collection(db, 'users');
  
    const q = query(usersCollection, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Создание нового пользователя
    let newUser = {}
    if(isExecutor)
      newUser = {
        email,
        nickname,
        password, 
        registration_date: Timestamp.now(),
        avatar: 'users avatars/default-avatar.png',
        country
    }
    else
      newUser = {
        email,
        nickname,
        password, 
        registration_date: Timestamp.now(),
        avatar: 'users avatars/default-avatar.png'
      };

    const docRef = await addDoc(usersCollection, newUser);
    if (!isExecutor) {
      await addDoc(collection(db, 'playlists'), {
        name: "Избранное",
        userId: docRef.id, // ID нового пользователя
        tracks: [],
        createdAt: Timestamp.now(),
        isFavorites: true // Флаг для быстрого поиска
      });
    }
    res.status(201).json({ id: docRef.id, ...newUser });

  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ message: error.message });
  }
});

// Вход пользователя
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('email', '==', email));
    let querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      const executorsCollection = collection(db, 'executors')
      const qexecutorsCollection = query(executorsCollection, where('email', '==', email));
      querySnapshot = await getDocs(qexecutorsCollection);
      if(querySnapshot.empty)
        return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    if (userData.password !== password) {
      return res.status(401).json({ message: 'Неверный пароль' });
    }

    res.json({ id: userDoc.id, ...userData });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ message: error.message });
  }
});

// Загрузка аватарки
app.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
  const { userId } = req.body;
  const avatarPath = `users-avatars/${req.file.filename}`; // Относительный путь к файлу

  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();

      // Удаляем старую аватарку, если она не базовая
      if (userData.avatar && !userData.avatar.includes('default-avatar.png')) {
        const oldAvatarPath = path.join(__dirname, `../soundly/public/${userData.avatar}`);
        fs.unlink(oldAvatarPath, (err) => {
          if (err) console.error('Ошибка при удалении старой аватарки:', err);
        });
      }

      // Обновляем путь к аватарке в Firestore
      await updateDoc(userRef, { avatar: avatarPath });
      res.status(200).json({ message: 'Аватар успешно загружен', avatar: avatarPath });
    } else {
      res.status(404).json({ message: 'Пользователь не найден' });
    }
  } catch (error) {
    console.error('Ошибка при загрузке аватарки:', error);
    res.status(500).json({ message: 'Ошибка при загрузке аватарки', error: error.message });
  }
});

// Загрузка трека и альбома
app.post('/upload-tracks', upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'tracks', maxCount: 10 }]), async (req, res) => {
  const { executorId, albumName, genre, trackNames } = req.body;

  // Пути к файлам
  const coverImagePath = `album-covers/${req.files['coverImage'][0].filename}`;
  console.log('Путь к обложке:', coverImagePath);

  try {
    // Создаем альбом
    const albumData = {
      executor_id: executorId,
      name: albumName,
      genre,
      release_date: new Date().toISOString(),
      image_src: coverImagePath,
    };

    const albumRef = await addDoc(collection(db, 'albums'), albumData);

    // Создаем треки
    const tracks = req.files['tracks'];
    for (let i = 0; i < tracks.length; i++) {
      const trackPath = `tracks/${tracks[i].filename}`;
      console.log('Путь к треку:', trackPath);
      
      const trackData = {
        album_id: albumRef.id,
        name: trackNames[i], // Используем название трека из trackNames
        file_path: trackPath,
        duration: 0, // Пока что оставляем 0, можно добавить логику для вычисления длительности трека
        number_of_plays: 0,
      };

      await addDoc(collection(db, 'tracks'), trackData);
    }

    res.status(201).json({ message: 'Альбом и треки успешно загружены', albumId: albumRef.id });
  } catch (error) {
    console.error('Ошибка при загрузке альбома:', error);
    res.status(500).json({ message: 'Ошибка при загрузке альбома', error: error.message });
  }
});

// Получение данных об альбомах и треках
app.get('/get-albums-and-tracks', async (req, res) => {
  try {
    const albumsSnapshot = await getDocs(collection(db, 'albums'));
    const albums = [];
    
    // Параллельная обработка альбомов для улучшения производительности
    const albumPromises = albumsSnapshot.docs.map(async (albumDoc) => {
      const albumData = albumDoc.data();
      
      // Проверка наличия executor_id
      if (!albumData.executor_id) {
        console.error(`Альбом ${albumDoc.id} не имеет executor_id`);
        return null;
      }

      try {
        // Получаем данные исполнителя с обработкой ошибок
        const executorDoc = await getDoc(doc(db, 'executors', albumData.executor_id));
        if (!executorDoc.exists()) {
          console.error(`Исполнитель с ID ${albumData.executor_id} не найден`);
          return null;
        }
        const executorData = executorDoc.data();

        // Получаем треки для альбома
        const tracksQuery = query(
          collection(db, 'tracks'),
          where('album_id', '==', albumDoc.id)
        );
        const tracksSnapshot = await getDocs(tracksQuery);
        
        const tracks = tracksSnapshot.docs.map(trackDoc => ({
          id: trackDoc.id,
          ...trackDoc.data()
        }));

        return {
          id: albumDoc.id,
          ...albumData,
          executor: executorData.nickname || 'Неизвестный исполнитель',
          image_src: albumData.image_src || '/default-album.jpg',
          tracks
        };
      } catch (error) {
        console.error(`Ошибка обработки альбома ${albumDoc.id}:`, error);
        return null;
      }
    });

    // Ожидаем завершения всех промисов и фильтруем null значения
    const results = await Promise.all(albumPromises);
    const validAlbums = results.filter(album => album !== null);

    res.status(200).json(validAlbums);
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
    res.status(500).json({ 
      message: 'Ошибка при получении данных',
      error: error.message 
    });
  }
});

// Получение плейлиста "Избранное" пользователя
app.get('/get-favorites', async (req, res) => {
  const { userId } = req.query;

  try {
    // 1. Находим плейлист "Избранное"
    const q = query(
      collection(db, 'playlists'),
      where('userId', '==', userId),
      where('isFavorites', '==', true)
    );
    const playlistSnapshot = await getDocs(q);
    
    if (playlistSnapshot.empty) {
      return res.status(200).json({ tracks: [] });
    }

    const playlist = playlistSnapshot.docs[0].data();
    
    // 2. Получаем полные данные о треках и их альбомах
    const tracksWithAlbums = await Promise.all(
      playlist.tracks.map(async (trackId) => {
        try {
          // Получаем данные трека
          const trackDoc = await getDoc(doc(db, 'tracks', trackId));
          if (!trackDoc.exists()) return null;
          
          const track = trackDoc.data();
          
          // Получаем данные альбома
          const albumDoc = await getDoc(doc(db, 'albums', track.album_id));
          const album = albumDoc.exists() ? albumDoc.data() : null;
          
          // Получаем данные исполнителя, если есть ID альбома
          let executor = null;
          if (album && album.executor_id) {
            const executorDoc = await getDoc(doc(db, 'users', album.executor_id));
            executor = executorDoc.exists() ? executorDoc.data() : null;
          }
          
          return {
            ...track,
            id: trackDoc.id,
            album: album ? {
              ...album,
              executor_name: executor ? executor.nickname : album.executor_name || 'Неизвестный исполнитель'
            } : null
          };
        } catch (error) {
          console.error(`Ошибка загрузки трека ${trackId}:`, error);
          return null;
        }
      })
    );

    res.status(200).json({
      id: playlistSnapshot.docs[0].id,
      tracks: tracksWithAlbums.filter(track => track !== null)
    });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/update-favorites', async (req, res) => {
  const { playlistId, trackId, action } = req.body;

  try {
    const playlistRef = doc(db, 'playlists', playlistId);
    
    await updateDoc(playlistRef, {
      tracks: action === 'add' 
        ? arrayUnion(trackId) 
        : arrayRemove(trackId)
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ 
      message: 'Ошибка при обновлении избранного',
      error: error.message 
    });
  }
});

// Создание нового плейлиста
app.post('/create-playlist', async (req, res) => {
  const { userId, name, description, isFavorites } = req.body;

  if (!userId || !name) {
    return res.status(400).json({ message: 'Отсутствуют обязательные поля' });
  }

  try {
    // Проверяем существование пользователя
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Создаем плейлист
    const playlistData = {
      userId,
      name,
      description: description || '',
      tracks: [],
      isFavorites: isFavorites || false,
      createdAt: serverTimestamp()
    };

    const playlistRef = await addDoc(collection(db, 'playlists'), playlistData);
    
    res.status(201).json({
      id: playlistRef.id,
      ...playlistData
    });
  } catch (error) {
    console.error('Ошибка при создании плейлиста:', error);
    res.status(500).json({ 
      message: 'Ошибка при создании плейлиста',
      error: error.message 
    });
  }
});

// Получение плейлистов пользователя
app.get('/get-user-playlists', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'Требуется ID пользователя' });
  }

  try {
    const q = query(
      collection(db, 'playlists'),
      where('userId', '==', userId)
    );
    
    const playlistsSnapshot = await getDocs(q);
    
    const playlists = [];
    playlistsSnapshot.forEach(doc => {
      playlists.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(playlists);
  } catch (error) {
    console.error('Ошибка при получении плейлистов:', error);
    res.status(500).json({ 
      message: 'Ошибка при получении плейлистов',
      error: error.message 
    });
  }
});

// Добавление/удаление треков из плейлиста
app.post('/update-playlist', async (req, res) => {
  const { playlistId, trackId, action } = req.body;

  if (!playlistId || !trackId || !action) {
    return res.status(400).json({ message: 'Отсутствуют обязательные поля' });
  }

  try {
    const playlistRef = doc(db, 'playlists', playlistId);
    const playlistDoc = await getDoc(playlistRef);
    
    if (!playlistDoc.exists()) {
      return res.status(404).json({ message: 'Плейлист не найден' });
    }
    
    await updateDoc(playlistRef, {
      tracks: action === 'add' 
        ? arrayUnion(trackId) 
        : arrayRemove(trackId)
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Ошибка при обновлении плейлиста:', error);
    res.status(500).json({ 
      message: 'Ошибка при обновлении плейлиста',
      error: error.message 
    });
  }
});

// Получение плейлиста по ID
app.get('/get-playlist/:id', async (req, res) => {
  const playlistId = req.params.id;

  if (!playlistId) {
    return res.status(400).json({ message: 'Требуется ID плейлиста' });
  }

  try {
    // Получаем документ плейлиста
    const playlistDoc = await getDoc(doc(db, 'playlists', playlistId));
    
    if (!playlistDoc.exists()) {
      return res.status(404).json({ message: 'Плейлист не найден' });
    }

    const playlist = { 
      id: playlistDoc.id, 
      ...playlistDoc.data() 
    };
    
    // Получаем полные данные о треках и их альбомах
    const tracksWithAlbums = await Promise.all(
      playlist.tracks.map(async (trackId) => {
        try {
          // Получаем данные трека
          const trackDoc = await getDoc(doc(db, 'tracks', trackId));
          if (!trackDoc.exists()) return null;
          
          const track = trackDoc.data();
          
          // Получаем данные альбома
          const albumDoc = await getDoc(doc(db, 'albums', track.album_id));
          const album = albumDoc.exists() ? albumDoc.data() : null;
          
          // Получаем данные исполнителя, если есть ID альбома
          let executor = null;
          if (album && album.executor_id) {
            const executorDoc = await getDoc(doc(db, 'users', album.executor_id));
            executor = executorDoc.exists() ? executorDoc.data() : null;
          }
          
          return {
            ...track,
            id: trackDoc.id,
            album: album ? {
              ...album,
              id: albumDoc.id,
              executor_name: executor ? executor.nickname : album.executor_name || 'Неизвестный исполнитель'
            } : null
          };
        } catch (error) {
          console.error(`Ошибка загрузки трека ${trackId}:`, error);
          return null;
        }
      })
    );

    // Обновляем массив треков полными данными
    playlist.tracks = tracksWithAlbums.filter(track => track !== null);
    
    res.status(200).json(playlist);
  } catch (error) {
    console.error('Ошибка при получении плейлиста:', error);
    res.status(500).json({ 
      message: 'Ошибка при получении плейлиста',
      error: error.message 
    });
  }
});

// Получение данных о музыканте по ID
app.get('/get-executor/:id', async (req, res) => {
  const executorId = req.params.id;
  
  if (!executorId) {
    return res.status(400).json({ message: 'Требуется ID музыканта' });
  }
  
  try {
    // Пытаемся найти музыканта сначала в коллекции users
    let executorDoc = await getDoc(doc(db, 'users', executorId));
    
    // Если не нашли, ищем в коллекции executors
    if (!executorDoc.exists()) {
      executorDoc = await getDoc(doc(db, 'executors', executorId));
      
      // Если и там не нашли, возвращаем 404
      if (!executorDoc.exists()) {
        return res.status(404).json({ message: 'Музыкант не найден' });
      }
    }
    
    const executorData = {
      id: executorDoc.id,
      ...executorDoc.data(),
    };
    
    res.status(200).json(executorData);
  } catch (error) {
    console.error('Ошибка при получении данных о музыканте:', error);
    res.status(500).json({ 
      message: 'Ошибка при получении данных о музыканте',
      error: error.message 
    });
  }
});

// Получение контента музыканта (треки и альбомы)
app.get('/get-executor-content/:id', async (req, res) => {
  const executorId = req.params.id;
  
  if (!executorId) {
    return res.status(400).json({ message: 'Требуется ID музыканта' });
  }
  
  try {
    // Получаем альбомы музыканта
    const albumsQuery = query(
      collection(db, 'albums'),
      where('executor_id', '==', executorId)
    );
    
    const albumsSnapshot = await getDocs(albumsQuery);
    const albums = [];
    const allTracks = [];
    
    // Обрабатываем каждый альбом и собираем треки
    for (const albumDoc of albumsSnapshot.docs) {
      const albumData = {
        id: albumDoc.id,
        ...albumDoc.data(),
      };
      
      // Получаем треки для этого альбома
      const tracksQuery = query(
        collection(db, 'tracks'),
        where('album_id', '==', albumDoc.id)
      );
      
      const tracksSnapshot = await getDocs(tracksQuery);
      const albumTracks = [];
      
      tracksSnapshot.forEach(trackDoc => {
        const trackData = {
          id: trackDoc.id,
          ...trackDoc.data(),
          album: {
            id: albumDoc.id,
            name: albumData.name,
            image_src: albumData.image_src,
            executor: albumData.executor_name || 'Неизвестный исполнитель',
            executor_name: albumData.executor_name || 'Неизвестный исполнитель',
            executor_id: executorId
          }
        };
        
        albumTracks.push(trackData);
        allTracks.push(trackData);
      });
      
      // Добавляем количество треков к альбому
      albumData.tracks_count = albumTracks.length;
      albums.push(albumData);
    }
    
    res.status(200).json({
      albums,
      tracks: allTracks
    });
  } catch (error) {
    console.error('Ошибка при получении контента музыканта:', error);
    res.status(500).json({ 
      message: 'Ошибка при получении контента музыканта',
      error: error.message 
    });
  }
});

// Поиск музыканта по имени
app.get('/get-executor-by-name', async (req, res) => {
  const { name } = req.query;
  
  if (!name) {
    return res.status(400).json({ message: 'Требуется имя музыканта' });
  }
  
  try {
    // Сначала ищем в коллекции users
    let executorsQuery = query(
      collection(db, 'users'),
      where('nickname', '==', name)
    );
    
    let executorsSnapshot = await getDocs(executorsQuery);
    
    // Если не нашли в users, ищем в коллекции executors
    if (executorsSnapshot.empty) {
      executorsQuery = query(
        collection(db, 'executors'),
        where('nickname', '==', name)
      );
      
      executorsSnapshot = await getDocs(executorsQuery);
      
      // Если и там не нашли, возвращаем 404
      if (executorsSnapshot.empty) {
        return res.status(404).json({ message: 'Музыкант не найден' });
      }
    }
    
    const executorDoc = executorsSnapshot.docs[0];
    const executorData = {
      id: executorDoc.id,
      ...executorDoc.data(),
    };
    
    res.status(200).json(executorData);
  } catch (error) {
    console.error('Ошибка при поиске музыканта:', error);
    res.status(500).json({ 
      message: 'Ошибка при поиске музыканта',
      error: error.message 
    });
  }
});

// Поиск треков по названию
app.get('/search-tracks', async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ message: 'Требуется поисковый запрос' });
  }
  
  try {
    // Получаем все треки из базы данных
    const tracksSnapshot = await getDocs(collection(db, 'tracks'));
    const matchedTracks = [];
    
    // Обрабатываем каждый трек для поиска совпадений
    for (const trackDoc of tracksSnapshot.docs) {
      const trackData = trackDoc.data();
      
      // Проверяем наличие поля name
      if (!trackData.name) {
        continue; // Пропускаем треки без названия
      }
      
      const trackName = trackData.name.toLowerCase();
      
      // Проверяем, содержит ли название трека поисковый запрос
      if (trackName.includes(query.toLowerCase())) {
        // Получаем данные альбома для трека
        const albumDoc = await getDoc(doc(db, 'albums', trackData.album_id));
        
        if (albumDoc.exists()) {
          const albumData = albumDoc.data();
          
          // Получаем данные исполнителя
          let executorData = null;
          if (albumData.executor_id) {
            // Сначала ищем в коллекции users
            let executorDoc = await getDoc(doc(db, 'users', albumData.executor_id));
            
            // Если не нашли, ищем в коллекции executors
            if (!executorDoc.exists()) {
              executorDoc = await getDoc(doc(db, 'executors', albumData.executor_id));
            }
            
            if (executorDoc.exists()) {
              executorData = executorDoc.data();
            }
          }
          
          // Добавляем трек в результаты поиска с данными альбома и исполнителя
          matchedTracks.push({
            id: trackDoc.id,
            ...trackData,
            album: {
              id: albumDoc.id,
              name: albumData.name,
              image_src: albumData.image_src,
              executor: executorData ? executorData.nickname : 'Неизвестный исполнитель',
              executor_name: executorData ? executorData.nickname : 'Неизвестный исполнитель',
              executor_id: albumData.executor_id
            }
          });
        }
      }
    }
    
    res.status(200).json(matchedTracks);
  } catch (error) {
    console.error('Ошибка при поиске треков:', error);
    res.status(500).json({
      message: 'Ошибка при поиске треков',
      error: error.message
    });
  }
});

// Обновление счетчика прослушиваний трека
app.post('/increment-track-plays', async (req, res) => {
  const { trackId } = req.body;
  
  if (!trackId) {
    return res.status(400).json({ message: 'Требуется ID трека' });
  }
  
  try {
    const trackRef = doc(db, 'tracks', trackId);
    const trackDoc = await getDoc(trackRef);
    
    if (!trackDoc.exists()) {
      return res.status(404).json({ message: 'Трек не найден' });
    }
    
    // Получаем текущее количество прослушиваний
    const trackData = trackDoc.data();
    const currentPlays = trackData.number_of_plays || 0;
    
    // Увеличиваем счетчик на 1
    await updateDoc(trackRef, {
      number_of_plays: currentPlays + 1
    });
    
    res.status(200).json({ 
      success: true,
      message: 'Счетчик прослушиваний обновлен',
      plays: currentPlays + 1
    });
  } catch (error) {
    console.error('Ошибка при обновлении счетчика прослушиваний:', error);
    res.status(500).json({
      message: 'Ошибка при обновлении счетчика прослушиваний',
      error: error.message
    });
  }
});

// Получение топ-треков (чарт)
app.get('/get-top-tracks', async (req, res) => {
  const { limit = 10 } = req.query; // По умолчанию возвращаем топ-10 треков
  
  try {
    // Получаем все треки
    const tracksSnapshot = await getDocs(collection(db, 'tracks'));
    const tracks = [];
    
    // Собираем данные о треках
    for (const trackDoc of tracksSnapshot.docs) {
      const trackData = trackDoc.data();
      
      // Пропускаем треки без названия
      if (!trackData.name) continue;
      
      // Получаем данные альбома
      const albumDoc = await getDoc(doc(db, 'albums', trackData.album_id));
      
      if (albumDoc.exists()) {
        const albumData = albumDoc.data();
        
        // Получаем данные исполнителя
        let executorData = null;
        if (albumData.executor_id) {
          // Сначала ищем в коллекции users
          let executorDoc = await getDoc(doc(db, 'users', albumData.executor_id));
          
          // Если не нашли, ищем в коллекции executors
          if (!executorDoc.exists()) {
            executorDoc = await getDoc(doc(db, 'executors', albumData.executor_id));
          }
          
          if (executorDoc.exists()) {
            executorData = executorDoc.data();
          }
        }
        
        // Добавляем трек с информацией об альбоме и исполнителе
        tracks.push({
          id: trackDoc.id,
          ...trackData,
          number_of_plays: trackData.number_of_plays || 0, // Если нет прослушиваний, устанавливаем 0
          album: {
            id: albumDoc.id,
            name: albumData.name,
            image_src: albumData.image_src,
            executor: executorData ? executorData.nickname : 'Неизвестный исполнитель',
            executor_name: executorData ? executorData.nickname : 'Неизвестный исполнитель',
            executor_id: albumData.executor_id
          }
        });
      }
    }
    
    // Сортируем треки по количеству прослушиваний (по убыванию)
    tracks.sort((a, b) => b.number_of_plays - a.number_of_plays);
    
    // Ограничиваем количество результатов
    const topTracks = tracks.slice(0, parseInt(limit));
    
    res.status(200).json(topTracks);
  } catch (error) {
    console.error('Ошибка при получении топ-треков:', error);
    res.status(500).json({
      message: 'Ошибка при получении топ-треков',
      error: error.message
    });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});