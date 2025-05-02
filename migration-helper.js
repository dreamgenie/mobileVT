/**
 * Migration helper to maintain compatibility between WaveformPlaylist and WaveSurfer
 * This file provides compatibility functions to ease the transition
 */

// Helper to convert WaveformPlaylist event emitter to WaveSurfer events
function createCompatibilityEmitter(wavesurfer) {
  return {
    on: function(event, callback) {
      if (event === 'timeupdate') {
        wavesurfer.on('audioprocess', callback);
      } else if (event === 'finished') {
        wavesurfer.on('finish', callback);
      } else {
        wavesurfer.on(event, callback);
      }
    },
    emit: function(event, ...args) {
      if (event === 'seek') {
        const position = args[0];
        wavesurfer.seekTo(position / wavesurfer.getDuration());
      } else if (event === 'play') {
        const startTime = args[0];
        if (startTime !== undefined) {
          wavesurfer.seekTo(startTime / wavesurfer.getDuration());
        }
        wavesurfer.play();
      } else if (event === 'stop') {
        wavesurfer.stop();
      } else if (event === 'pause') {
        wavesurfer.pause();
      } else if (event === 'mastervolumechange') {
        const volume = args[0] / 100;
        wavesurfer.setVolume(volume);
      } else if (event === 'newtrack') {
        const [blob, name, width] = args;
        wavesurfer.loadBlob(blob);
      } else if (event === 'markvtstart') {
        const time = args[0];
        // Add a marker for VT start
        const regions = wavesurfer.regions.getRegions();
        Object.values(regions).forEach(region => {
          if (region.data && region.data.type === 'vtstart') {
            region.remove();
          }
        });
        
        wavesurfer.regions.addRegion({
          start: time,
          end: time + 0.1,
          color: 'rgba(255, 0, 0, 0.5)',
          data: {
            type: 'vtstart'
          }
        });
      }
    }
  };
}

// Helper to convert WaveSurfer to WaveformPlaylist API
function createWaveSurfer(containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with ID ${containerId} not found`);
    return null;
  }
  
  // Default options
  const defaultOptions = {
    container: container,
    waveColor: '#3498db',
    progressColor: '#2980b9',
    cursorColor: '#333',
    height: 100,
    responsive: true,
    normalize: true,
    plugins: [
      WaveSurfer.timeline.create({
        container: `#${containerId}-timeline`,
        primaryColor: '#333',
        secondaryColor: '#666',
        primaryFontColor: '#000',
        secondaryFontColor: '#444'
      }),
      WaveSurfer.cursor.create({
        showTime: true,
        opacity: 1,
        customShowTimeStyle: {
          'background-color': '#000',
          color: '#fff',
          padding: '2px',
          'font-size': '10px'
        }
      }),
      WaveSurfer.regions.create()
    ]
  };
  
  // Create timeline container if it doesn't exist
  if (!document.getElementById(`${containerId}-timeline`)) {
    const timelineContainer = document.createElement('div');
    timelineContainer.id = `${containerId}-timeline`;
    timelineContainer.style.height = '20px';
    container.parentNode.insertBefore(timelineContainer, container.nextSibling);
  }
  
  // Merge options
  const mergedOptions = Object.assign({}, defaultOptions, options);
  
  // Create WaveSurfer instance
  const wavesurfer = WaveSurfer.create(mergedOptions);
  
  // Add compatibility methods
  wavesurfer.loadBlob = function(blob) {
    if (!blob) return;
    
    // Create object URL
    const objectUrl = URL.createObjectURL(blob);
    
    // Load the audio
    wavesurfer.load(objectUrl);
    
    // Clean up object URL when done
    wavesurfer.once('destroy', () => {
      URL.revokeObjectURL(objectUrl);
    });
  };
  
  wavesurfer.getCurrentTime = function() {
    return wavesurfer.getCurrentTime();
  };
  
  wavesurfer.getDuration = function() {
    return wavesurfer.getDuration();
  };
  
  // Add regions plugin if not already added
  if (!wavesurfer.regions) {
    wavesurfer.registerPlugin(WaveSurfer.regions.create());
  }
  
  return wavesurfer;
}
