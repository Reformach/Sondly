const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'avatar') {
      cb(null, path.join(__dirname, '../soundly/public/users-avatars')); // Папка для аватарок
    } else if (file.fieldname === 'coverImage') {
      cb(null, path.join(__dirname, '../soundly/public/album-covers')); // Папка для обложек
    } else if (file.fieldname === 'tracks') {
      cb(null, path.join(__dirname, '../soundly/public/tracks')); // Папка для треков
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Уникальное имя файла
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'avatar' && file.mimetype.startsWith('image/')) {
    cb(null, true); // Принимаем только изображения для аватарок
  } else if (file.fieldname === 'coverImage' && file.mimetype.startsWith('image/')) {
    cb(null, true); // Принимаем только изображения для обложек
  } else if (file.fieldname === 'tracks' && file.mimetype.startsWith('audio/')) {
    cb(null, true); // Принимаем только аудиофайлы для треков
  } else {
    cb(new Error('Неподдерживаемый тип файла!'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;