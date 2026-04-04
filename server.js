'use strict';

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// --- папка для загрузок ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// --- multer ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const name = Date.now() + '-' + file.originalname.replace(/\s/g, '');
    cb(null, name);
  }
});
const upload = multer({ storage });

// --- middleware ---
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// --- база (файл) ---
const DB_FILE = path.join(__dirname, 'data.json');

function readDB() {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// --- API ---
app.get('/api/items', (req, res) => {
  res.json(readDB());
});

app.post('/api/items', upload.single('photo'), (req, res) => {
  const { title, price, description } = req.body;

  const item = {
    id: Date.now(),
    title,
    price,
    description,
    photo: req.file ? '/uploads/' + req.file.filename : null
  };

  const db = readDB();
  db.push(item);
  writeDB(db);

  res.json({ success: true });
});

// --- фронт ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- запуск ---
app.listen(PORT, () => {
  console.log(`🔥 Server started: http://localhost:${PORT}`);
});
