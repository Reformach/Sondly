const express = require('express');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, updateDoc, getDoc, addDoc} = require('firebase/firestore');
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
  const { email, nickname, password } = req.body;

  try {
    // Проверка, существует ли пользователь с таким email
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Создание нового пользователя
    const newUser = {
      email,
      nickname,
      password, // В реальном приложении пароль должен быть хэширован!
      registration_date: new Date().toISOString(),
      avatar: 'users avatars/default-avatar.png', // Базовая аватарка
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
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
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
  const avatarPath = `users avatars/${req.file.filename}`; // Относительный путь к файлу

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

// Запуск сервера
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});