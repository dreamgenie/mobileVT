// Replace WebAudioRecorder with WaveSurfer's microphone plugin or MediaRecorder API
function setupRecording() {
  // Create a MediaRecorder instance
  const chunks = [];
  const stream = mixedAudioSource.mediaStream;
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'audio/webm'
  });
  
  mediaRecorder.ondataavailable = function(e) {
    chunks.push(e.data);
  };
  
  mediaRecorder.onstop = function() {
    const blob = new Blob(chunks, { type: 'audio/mp3' });
    // Process recorded audio
    processRecordedAudio(blob);
  };
  
  return mediaRecorder;
}

// Audio trimming function
function trimAudio(wavesurfer, start, end) {
  return new Promise((resolve, reject) => {
    // Get the audio buffer from WaveSurfer
    const buffer = wavesurfer.backend.buffer;
    if (!buffer) {
      reject(new Error('No audio buffer available'));
      return;
    }
    
    // Validate start and end points
    const duration = buffer.duration;
    start = Math.max(0, start || 0);
    end = Math.min(duration, end || duration);
    
    if (start >= end) {
      reject(new Error('Invalid trim points'));
      return;
    }
    
    // Calculate frame positions
    const sampleRate = buffer.sampleRate;
    const startFrame = Math.floor(start * sampleRate);
    const endFrame = Math.floor(end * sampleRate);
    const frameCount = endFrame - startFrame;
    
    // Create a new buffer for the trimmed audio
    const newBuffer = new AudioBuffer({
      numberOfChannels: buffer.numberOfChannels,
      length: frameCount,
      sampleRate: sampleRate
    });
    
    // Copy the data from the original buffer to the new buffer
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      const newChannelData = newBuffer.getChannelData(channel);
      
      for (let i = 0; i < frameCount; i++) {
        newChannelData[i] = channelData[startFrame + i];
      }
    }
    
    resolve(newBuffer);
  });
}

// Audio mixing function
function mixAudioTracks(track1Buffer, track2Buffer, mixPoint, fadeTime) {
  return new Promise((resolve, reject) => {
    if (!track1Buffer || !track2Buffer) {
      reject(new Error('Invalid audio buffers'));
      return;
    }
    
    // Create an offline context for mixing
    const sampleRate = track1Buffer.sampleRate;
    const totalLength = Math.max(
      track1Buffer.length,
      track2Buffer.length + Math.floor(mixPoint * sampleRate)
    );
    
    const offlineCtx = new OfflineAudioContext({
      numberOfChannels: 2,
      length: totalLength,
      sampleRate: sampleRate
    });
    
    // Create sources and gains
    const source1 = offlineCtx.createBufferSource();
    const source2 = offlineCtx.createBufferSource();
    const gain1 = offlineCtx.createGain();
    const gain2 = offlineCtx.createGain();
    
    // Connect nodes
    source1.buffer = track1Buffer;
    source2.buffer = track2Buffer;
    source1.connect(gain1);
    source2.connect(gain2);
    gain1.connect(offlineCtx.destination);
    gain2.connect(offlineCtx.destination);
    
    // Schedule playback
    source1.start(0);
    source2.start(mixPoint);
    
    // Apply fade
    const fadeStartTime = mixPoint;
    const fadeEndTime = mixPoint + fadeTime;
    
    gain1.gain.setValueAtTime(1, fadeStartTime);
    gain1.gain.linearRampToValueAtTime(0, fadeEndTime);
    
    // Render the mixed audio
    offlineCtx.startRendering()
      .then(renderedBuffer => {
        resolve(renderedBuffer);
      })
      .catch(err => {
        reject(err);
      });
  });
}

// Function to convert AudioBuffer to Blob
function audioBufferToBlob(buffer, format = 'mp3') {
  return new Promise((resolve, reject) => {
    // Create a MediaStreamDestination to get a MediaStream
    const offlineCtx = new OfflineAudioContext({
      numberOfChannels: buffer.numberOfChannels,
      length: buffer.length,
      sampleRate: buffer.sampleRate
    });
    
    const source = offlineCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(offlineCtx.destination);
    source.start(0);
    
    offlineCtx.startRendering()
      .then(renderedBuffer => {
        // Create a MediaRecorder to encode the audio
        const stream = new MediaStream();
        const audioCtx = new AudioContext();
        const dest = audioCtx.createMediaStreamDestination();
        const sourceNode = audioCtx.createBufferSource();
        sourceNode.buffer = renderedBuffer;
        sourceNode.connect(dest);
        sourceNode.start(0);
        
        const mediaRecorder = new MediaRecorder(dest.stream);
        const chunks = [];
        
        mediaRecorder.ondataavailable = e => {
          chunks.push(e.data);
        };
        
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/mp3' });
          resolve(blob);
        };
        
        mediaRecorder.start();
        
        // Stop recording after the buffer duration
        setTimeout(() => {
          mediaRecorder.stop();
          sourceNode.stop();
          audioCtx.close();
        }, renderedBuffer.duration * 1000 + 100);
      })
      .catch(err => {
        reject(err);
      });
  });
}
