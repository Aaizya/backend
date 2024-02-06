const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { GridFSBucket, MongoClient } = require('mongodb');

const app = express();

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/Cinema', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');

  // Создание экземпляра GridFSBucket с указанием имени коллекции
  const bucket = new GridFSBucket(db, { bucketName: 'photos' });
});

// Маршрут 
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


app.get('/app.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'app.js'));
});

app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'style.css'));
});

// изображений из MongoDB
app.get('/photos/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const client = new MongoClient('mongodb://localhost:27017', { useUnifiedTopology: true });
    await client.connect();


    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(id));

    
    const contentType = getContentType(id);
    res.set('Content-Type', contentType);

    // Перенаправляем поток данных изображения в ответ
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error retrieving image:', error);
    res.status(500).send('Internal Server Error');
  }
});


function getContentType(filename) {
  const extension = path.extname(filename).toLowerCase();
  switch (extension) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    default:
      return 'application/octet-stream'; 
  }
}

const User = require('./models/User');
const Task = require('./models/Task');

// Add routes for creating users and tasks
app.post('/api/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
