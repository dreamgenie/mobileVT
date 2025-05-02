/**
 * WaveSurfer initialization script
 * This file handles the initialization of WaveSurfer instances and provides
 * utility functions for working with WaveSurfer
 */

// Utility function to create WaveSurfer instances with common settings
function createWaveSurfer(containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found`);
    return null;
  }
  
  // Create timeline container if needed
  let timelineContainer = document.getElementById(`${containerId}-timeline`);
  if (!timelineContainer && options.timeline !== false) {
    timelineContainer = document.createElement('div');
    timelineContainer.id = `${containerId}-timeline`;
    container.parentNode.insertBefore(timelineContainer, container.nextSibling);
  }
  
  // Default options
  const defaultOptions = {
    container: container,
    waveColor: 'rgb(200, 200, 200)',
    progressColor: 'rgb(100, 100, 100)',
    height: 128,
    normalize: true,
    plugins: []
  };
  
  // Add plugins based on options
  if (options.timeline !== false && timelineContainer) {
    defaultOptions.plugins.push(
      WaveSurfer.timeline.create({
        container: `#${containerId}-timeline`
      })
    );
  }
  
  if (options.cursor !== false) {
    defaultOptions.plugins.push(
      WaveSurfer.cursor.create({
        showTime: true,
        opacity: 1,
        color: 'red'
      })
    );
  }
  
  if (options.regions !== false) {
    defaultOptions.plugins.push(
      WaveSurfer.regions.create()
    );
  }
  
  // Merge options
  const wsOptions = {...defaultOptions, ...options};
  
  // Create and return WaveSurfer instance
  return WaveSurfer.create(wsOptions);
}

// Initialize WaveSurfer for recording
function initRecordingWaveSurfer() {
  // Create audio context
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  window.globalAudioContext = audioContext;
  
  // Initialize microphone access
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      // Create recorder
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];
      
      mediaRecorder.addEventListener('dataavailable', event => {
        audioChunks.push(event.data);
      });
      
      mediaRecorder.addEventListener('stop', () => {
        // Create blob from recorded chunks
        const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
        
        // Process the recorded audio
        processRecordedAudio(audioBlob);
        
        // Clear chunks for next recording
        audioChunks.length = 0;
      });
      
      // Store recorder for later use
      window.voiceTrackRecorder = mediaRecorder;
      
      // Initialize audio meter
      initAudioMeter('audiometer');
    })
    .catch(error => {
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone. Please check your microphone settings and permissions.');
    });
}

// Function to create a WaveSurfer timeline
function createWaveSurferTimeline(wavesurfer, container) {
  if (!wavesurfer || !container) return null;
  
  // Create timeline container if it's a string ID
  let timelineContainer = container;
  if (typeof container === 'string') {
    timelineContainer = document.getElementById(container);
    if (!timelineContainer) {
      const newContainer = document.createElement('div');
      newContainer.id = container;
      document.body.appendChild(newContainer);
      timelineContainer = newContainer;
    }
  }
  
  // Create and return timeline
  return wavesurfer.registerPlugin(
    WaveSurfer.timeline.create({
      container: timelineContainer,
      primaryColor: '#333',
      secondaryColor: '#666',
      primaryFontColor: '#000',
      secondaryFontColor: '#444'
    })
  );
}

// Function to create a WaveSurfer regions plugin
function createWaveSurferRegions(wavesurfer) {
  if (!wavesurfer) return null;
  
  return wavesurfer.registerPlugin(
    WaveSurfer.regions.create()
  );
}

// Function to create a WaveSurfer cursor plugin
function createWaveSurferCursor(wavesurfer) {
  if (!wavesurfer) return null;
  
  return wavesurfer.registerPlugin(
    WaveSurfer.cursor.create({
      showTime: true,
      opacity: 1,
      customShowTimeStyle: {
        'background-color': '#000',
        color: '#fff',
        padding: '2px',
        'font-size': '10px'
      }
    })
  );
}

// Initialize WaveSurfer when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Initialize recording functionality
  initRecordingWaveSurfer();
  
  // Create timeline containers if they don't exist
  ['playlist1-timeline', 'playlist2-timeline', 'playlist3-timeline'].forEach(id => {
    if (!document.getElementById(id)) {
      const container = document.createElement('div');
      container.id = id;
      container.style.height = '20px';
      document.body.appendChild(container);
    }
  });
});
