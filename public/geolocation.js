// Client-side IP detection (before form submit)
(async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const ipData = await response.json();
    window.publicIP = ipData.ip;
  } catch {}
})();

