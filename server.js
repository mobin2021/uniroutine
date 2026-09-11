// UniRoutine - Express API & Static Server
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Load mock dataset (Sanitized for open-source privacy)
const mockDataPath = path.join(__dirname, 'data', 'mock_routines.json');
let routineDatabase = JSON.parse(fs.readFileSync(mockDataPath, 'utf-8'));

// API: Get all routine data and directory
app.get('/api/routines', (req, res) => {
  res.json(routineDatabase);
});

// API: Post new announcement (CR or Teacher)
app.post('/api/notices', (req, res) => {
  const { title, message, author, urgent } = req.body;
  if (!title || !message || !author) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newNotice = {
    id: Date.now(),
    title,
    message,
    author,
    timestamp: 'Just now',
    urgent: Boolean(urgent)
  };

  routineDatabase.notices.unshift(newNotice);
  res.status(201).json({ success: true, notice: newNotice });
});

// Fallback to PWA root
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  UniRoutine Server running on port ${PORT}`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  PWA & Offline Cache enabled`);
  console.log(`===============================================`);
});
