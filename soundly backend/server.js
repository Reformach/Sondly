const express = require('express');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, updateDoc, getDoc, addDoc, Timestamp} = require('firebase/firestore');
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
app.use('/public', express.static(path.join(__dirname, '../public')));

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
      const trackData = {
        album_id: albumRef.id,
        name: trackNames[i], // Используем название трека из trackNames
        file_path: `tracks/${tracks[i].filename}`,
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

// Запуск сервера
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});