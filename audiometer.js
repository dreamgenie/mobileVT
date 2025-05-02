// Replace the existing audio meter implementation with WaveSurfer's microphone plugin
class AudioMeter {
  constructor(container, options = {}) {
    this.container = container;
    this.options = Object.assign({
      width: container.clientWidth || 300,
      height: container.clientHeight || 50,
      backgroundColor: '#222',
      meterColor: 'linear-gradient(90deg, green, yellow, red)',
      smoothing: 0.8
    }, options);
    
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
    this.container.appendChild(this.canvas);
    
    this.ctx = this.canvas.getContext('2d');
    this.volume = 0;
    this.isActive = false;
    
    // Create audio context and analyzer
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    // Set up microphone access
    this.setupMicrophone();
  }
  
  setupMicrophone() {
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(stream => {
        this.stream = stream;
        this.source = this.audioContext.createMediaStreamSource(stream);
        this.source.connect(this.analyser);
        this.isActive = true;
        this.draw();
      })
      .catch(err => {
        console.error('Error accessing microphone:', err);
      });
  }
  
  draw() {
    if (!this.isActive) return;
    
    requestAnimationFrame(() => this.draw());
    
    // Get volume data
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate volume
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    const average = sum / this.dataArray.length;
    
    // Apply smoothing
    this.volume = this.volume * this.options.smoothing + average * (1 - this.options.smoothing);
    
    // Draw meter
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Background
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Create gradient
    const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
    gradient.addColorStop(0, 'green');
    gradient.addColorStop(0.6, 'yellow');
    gradient.addColorStop(1, 'red');
    
    // Meter
    const meterWidth = (this.volume / 255) * this.canvas.width;
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, meterWidth, this.canvas.height);
  }
  
  start() {
    if (!this.isActive && this.stream) {
      this.isActive = true;
      this.draw();
    }
  }
  
  stop() {
    this.isActive = false;
    
    // Clear the meter
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  destroy() {
    this.stop();
    
    // Stop microphone
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    
    // Remove canvas
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Initialize audio meter
function initAudioMeter(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;
  
  return new AudioMeter(container);
}
