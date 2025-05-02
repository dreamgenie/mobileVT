// New recording functionality using MediaRecorder API
function setupRecording(stream) {
  let mediaRecorder;
  let audioChunks = [];
  
  // Create MediaRecorder instance
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
  } else {
    mediaRecorder = new MediaRecorder(stream);
  }
  
  // Handle data available event
  mediaRecorder.ondataavailable = function(event) {
    audioChunks.push(event.data);
  };
  
  // Handle recording stop event
  mediaRecorder.onstop = function() {
    const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
    audioChunks = [];
    
    // Process the recorded audio
    processRecordedAudio(audioBlob);
  };
  
  return {
    start: function() {
      audioChunks = [];
      mediaRecorder.start();
    },
    stop: function() {
      if (mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    },
    pause: function() {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.pause();
      }
    },
    resume: function() {
      if (mediaRecorder.state === 'paused') {
        mediaRecorder.resume();
      }
    },
    getState: function() {
      return mediaRecorder.state;
    }
  };
}

// Process recorded audio
function processRecordedAudio(audioBlob) {
  // Create a name for the recording
  const fileName = `voicetrack_${new Date().toISOString().replace(/[:.]/g, '-')}.mp3`;
  
  // Create a File object from the Blob
  const mp3file = new File([audioBlob], fileName, { type: 'audio/mp3' });
  
  // Load the recording into playlist3
  playlist3.loadBlob(audioBlob);
  
  // Set the voice track file name and path
  curVoiceTrackFile = fileName;
  curVoiceTrackFullPath = "Music/VoiceTracks/" + fileName;
  
  // Add the file to the ZIP
  extractedFile.file(curVoiceTrackFullPath, mp3file);
  
  // Update the PLS file
  extractedFile.remove(plsFileFullName);
  extractedFile.file(plsFileFullName, ComposePLS(fileName));
  
  // Set the next start time
  nextstart = curVoiceTrackLengthSecond;
  
  // Update the MP3 tag
  audioBlob.arrayBuffer().then(buffer => {
    const taggedBlob = writeMp3Tag(buffer, fileName, nextstart, vtStart);
    extractedFile.file(curVoiceTrackFullPath, taggedBlob);
  });
  
  // Emit the voicetrackblob event to maintain compatibility
  ee3.emit("voicetrackblob", mp3file);
  
  // Update the UI
  const canvasdiv = document.getElementById("form3");
  canvasdiv.innerText = fileName + "  ---  " + getHMS(curVoiceTrackLengthSecond);
  canvasdiv.style.fontSize = "2.2vh";
  
  // Add markers for VT start and next start
  const regions = playlist3.regions.getRegions();
  
  // Remove existing markers
  Object.values(regions).forEach(region => {
    if (region.data && (region.data.type === 'vtstart' || region.data.type === 'nextstart')) {
      region.remove();
    }
  });
  
  // Add VT start marker
  playlist3.regions.addRegion({
    start: vtStart,
    end: vtStart + 0.1,
    color: 'rgba(255, 0, 0, 0.5)',
    data: {
      type: 'vtstart'
    }
  });
  
  // Add next start marker
  playlist3.regions.addRegion({
    start: nextstart,
    end: nextstart + 0.1,
    color: 'rgba(0, 0, 255, 0.5)',
    data: {
      type: 'nextstart'
    }
  });
}

// Initialize recording when microphone access is granted
function initializeRecording(stream) {
  userMediaStream = stream;
  const compressionChk = document.getElementById("compression");
  const eqChk = document.getElementById("eqsettings");
  
  // Create recorder
  const recorder = setupRecording(stream);
  
  // Store recorder in global scope or attach to playlist3
  window.voiceTrackRecorder = recorder;
  
  // Hide loading spinner
  const spinprogress = document.getElementById("spinprogress");
  spinprogress.style.display = "none";
  
  return recorder;
}
