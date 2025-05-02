// Replace existing VU meter implementation
function setupVUMeter(container) {
  // Create a canvas for the VU meter if it doesn't exist
  if (!container.getContext) {
    console.error("Container must be a canvas element");
    return null;
  }
  
  // Create WaveSurfer instance with microphone plugin
  const micWaveSurfer = WaveSurfer.create({
    container: container.parentElement,
    waveColor: 'green',
    interact: false,
    cursorWidth: 0,
    plugins: [
      WaveSurfer.microphone.create()
    ]
  });
  
  // Hide the waveform display
  const waveformElement = container.parentElement.querySelector('wave');
  if (waveformElement) {
    waveformElement.style.display = 'none';
  }
  
  // Start microphone
  micWaveSurfer.microphone.start();
  
  // Set up analyzer for volume levels
  micWaveSurfer.microphone.on('deviceReady', function() {
    const analyser = micWaveSurfer.microphone.analyser;
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Draw VU meter
    function drawVUMeter() {
      if (recordstate !== "recording") {
        requestAnimationFrame(drawVUMeter);
        return;
      }
      
      requestAnimationFrame(drawVUMeter);
      
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for(let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength / 255;
      
      // Update VU meter display
      const ctx = container.getContext('2d');
      ctx.clearRect(0, 0, container.width, container.height);
      
      const gradient = ctx.createLinearGradient(0, 0, container.width, 0);
      gradient.addColorStop(0, 'green');
      gradient.addColorStop(0.9, '#FF8C00');
      gradient.addColorStop(1, 'red');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, average * container.width, container.height);
    }
    
    drawVUMeter();
  });
  
  // Handle errors
  micWaveSurfer.microphone.on('deviceError', function(error) {
    console.error('Device error:', error);
  });
  
  return micWaveSurfer;
}

// Initialize VU meter when needed
function initializeVUMeter() {
  const meterCanvas = document.getElementById('meter');
  if (meterCanvas) {
    const vuMeter = setupVUMeter(meterCanvas);
    return vuMeter;
  }
  return null;
}


