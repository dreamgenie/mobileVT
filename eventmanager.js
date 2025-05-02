var userMediaStream;
var playlist1, playlist2;

navigator.getUserMedia = (navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia);

function gotStream(stream) {
  userMediaStream = stream;
  var compressionChk = document.getElementById("compression");
  var eqChk = document.getElementById("eqsettings");
  playlist3.initRecorder(userMediaStream, compressionChk.checked, eqChk.checked, eqset1, eqset2, eqset3, eqset4, eqset5);
  var spinprogress = document.getElementById("spinprogress");			
  spinprogress.style.display = "none";
  // $(".btn-record").removeClass("disabled");
  // console.log("gotStream", compressionChk.checked, eqChk.checked);
}

function startUserMedia(deviceID) {
  // CONSTRAINTS INITIALIZED AS WINDOW VARIABLE IN INDEX.HTML SO THEY APPLY TO ALL AUDIO CAPTURE
  // var constraints;
  if (deviceID == "" || deviceID == undefined)
    ;// constraints = {audio: true};
  else {
    localStorage.savedPlaybackDevice = deviceID;
    // constraints = {
    //   audio: {
    //     deviceId: { exact: deviceID },
    //     echoCancellation: true,
    //     noiseSuppression: true,
    //     autoGainControl: true
    //   }
    // };
    constraints.audio.deviceId = deviceID;
  }
    

  if (navigator.mediaDevices) {
	if (isSafari == false)   ///04/16/23
	{
    navigator.mediaDevices.getUserMedia(constraints).then(gotStream).catch(logError);
	}
  }
  else
  if (navigator.getUserMedia && 'MediaRecorder' in window) {
    navigator.getUserMedia(constraints, gotStream, logError);
  }
}

function logError(err) {
  console.error(err);
}

playlist1 = createWaveSurfer("curform", {
  height: 40,
  waveColor: 'black',
  progressColor: '#4353FF',
  cursorColor: 'red',
  minPxPerSec: 100,
  scrollParent: true,
  normalize: true
});

playlist1.on('ready', function() {
  const duration = playlist1.getDuration();
  locked1 = false;
  
  // Add click handler for seeking
  const canvas = document.getElementById("curform");
  canvas.addEventListener("mousedown", function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const seekPosition = x / canvas.clientWidth * duration;
    playlist1.seekTo(seekPosition / duration);
  }, false);
  
  curTrackLengthSeconds1 = duration;
  const canvasdiv = document.getElementById("form1");
  canvasdiv.innerText = curTrackName1 + "  ---  " + getHMS(curTrackLengthSeconds1);
  canvasdiv.style.fontSize = "2.2vh";
});

playlist1.on('finish', function() {
  if (recordstate === "playing" && vtStart === 10000) {
    playlist3.play();
  }
});

// Add a method to maintain API compatibility
playlist1.getEventEmitter = function() {
  return {
    on: function(event, callback) {
      playlist1.on(event, callback);
    },
    emit: function(event, ...args) {
      if (event === 'seek') {
        const position = args[0] / document.getElementById("curform").clientWidth;
        playlist1.seekTo(position);
      } else if (event === 'play') {
        playlist1.play();
      } else if (event === 'stop') {
        playlist1.stop();
      } else if (event === 'mastervolumechange') {
        playlist1.setVolume(args[0] / 100);
      } else if (event === 'newtrack') {
        const [blob, name, width] = args;
        playlist1.loadBlob(blob);
        curTrackName1 = name;
      }
    }
  };
};

// Initialize the event emitter reference to maintain compatibility
var ee1 = playlist1.getEventEmitter();

playlist2 = WaveformPlaylist.init({
  samplesPerPixel: 5000,
  waveHeight: 40,//document.getElementById("nextform").clientHeight + 2,
  container: document.getElementById("nextform"),
  state: 'cursor',
  colors: {
    waveOutlineColor: 'black',
    timeColor: 'red',
    fadeColor: 'black'
  },
  timescale: true,
  controls: {
    show: false, //whether or not to include the track controls
    width: 200 //width of controls in pixels
  },
  seekStyle : 'line',
  zoomLevels: [500, 1000, 3000, 5000],
  waveWidth: document.getElementById("nextform").clientWidth
});

playlist3 = createWaveSurfer("vtform", {
  height: 40,
  waveColor: 'black',
  progressColor: '#4353FF',
  cursorColor: 'red',
  minPxPerSec: 100,
  scrollParent: true,
  normalize: true
});

playlist3.on('ready', function() {
  const duration = playlist3.getDuration();
  
  // Add click handler for seeking
  const canvas = document.getElementById("vtform");
  canvas.addEventListener("mousedown", function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const seekPosition = x / canvas.clientWidth * duration;
    playlist3.seekTo(seekPosition / duration);
  }, false);
  
  curVoiceTrackLengthSecond = duration;
  const canvasdiv = document.getElementById("form3");
  canvasdiv.innerText = getVoiceTrackName() + "  ---  " + getHMS(curVoiceTrackLengthSecond);
  canvasdiv.style.fontSize = "2.2vh";
});

playlist3.on('audioprocess', function(time) {
  voicetrackPlaySecond = time;
  
  // Emit timeupdate event for compatibility
  if (ee3) {
    ee3.emit('timeupdate', time);
  }
  
  // Check if we need to start the next track
  if (voicetrackPlaySecond > nextstart && recordstate === "playing" && rightTrackState === false) {
    rightTrackState = true;
    ee2.emit("play");
    
    // Fade out the first track
    var curvolume = localStorage.miclevel || 80;
    var fadeAudio = setInterval(function () {
      if (curvolume > 0) {
        curvolume -= 20;
        ee1.emit("mastervolumechange", curvolume);
      } else {
        ee1.emit("stop");
        ee1.emit("mastervolumechange", 100);
        clearInterval(fadeAudio);
      }
    }, fadetime * 1000 / 5);
  }
});

playlist3.on('finish', function() {
  recordstate = "stopped";
  rightTrackState = false;
});

// Add compatibility layer
playlist3.getEventEmitter = function() {
  return {
    on: function(event, callback) {
      if (event === 'timeupdate') {
        playlist3.on('audioprocess', callback);
      } else {
        playlist3.on(event, callback);
      }
    },
    emit: function(event, ...args) {
      if (event === 'seek') {
        const position = args[0] / document.getElementById("vtform").clientWidth;
        playlist3.seekTo(position);
      } else if (event === 'play') {
        playlist3.play();
      } else if (event === 'stop') {
        playlist3.stop();
      } else if (event === 'mastervolumechange') {
        playlist3.setVolume(args[0] / 100);
      } else if (event === 'newtrack') {
        const [blob, name, width] = args;
        playlist3.loadBlob(blob);
      } else if (event === 'voicetrackblob') {
        // Handle voicetrack blob event
        const mp3file = args[0];
        curVoiceTrackFullPath = "Music/Tracks/" + mp3file.name;
        extractedFile.file(curVoiceTrackFullPath, mp3file);
        extractedFile.remove(plsFileFullName);
        extractedFile.file(plsFileFullName, ComposePLS(mp3file.name));
      }
    }
  };
};

var ee3 = playlist3.getEventEmitter();

ee1.on("timeupdate", function(sec) {
  playbackSeconds1 = sec;

  if (playbackSeconds1 > vtStart && recordstate === "playing" && voiceTrackState === false) {
    voiceTrackState = true;
    ee3.emit("play");
	ee1.emit("mastervolumechange", 100 - ducking); ///WP 11/22
	ee2.emit("mastervolumechange", 100 - ducking); ///WP 11/22
  }

  // if (playbackSeconds1 > vtStart + leftTrackKeepTime && recordstate === "playing") {
  //       ee1.emit("stop");
  //       ee1.emit("mastervolumechange", 100);
  // }

  var canvasdiv = document.getElementById("form1");
  canvasdiv.innerText = curTrackName1 + "  ---  " + getHMS(curTrackLengthSeconds1 - playbackSeconds1);;  
  //canvasdiv.innerText += "\n";
  //canvasdiv.innerText += getHMS(curTrackLengthSeconds1 - playbackSeconds1);
});

ee2.on("loaded", function(duration) {
  locked2 = false;
  var canvas = document.getElementById("nextform").getElementsByTagName("canvas")[0];
  canvas.addEventListener("mousedown", function( event ) {
    ee2.emit("seek", event.offsetX);
  }, false);

  curTrackLengthSeconds2 = duration;
  var canvasdiv = document.getElementById("form2");
  canvasdiv.innerText = curTrackName2 + "  ---  " + getHMS(curTrackLengthSeconds2);  
  canvasdiv.style.fontSize = "2.2vh";
  playbackSeconds2 = 0; ///07/2023/WP
  //canvasdiv.innerText += "\n";
  //canvasdiv.innerText += getHMS(curTrackLengthSeconds2);
});

ee2.on("timeupdate", function(sec) {
	
  playbackSeconds2 = sec;	 ///06/28/2023
	
  var canvasdiv = document.getElementById("form2");
  
  //08/29/23 WP
  if (introTime2 > 0 && sec < introTime2)
	{
	  canvasdiv.innerText = getHMS(introTime2 - sec) + " :INTRO " + curTrackName2;
	}
	else
	{
		canvasdiv.innerText = curTrackName2 + "  ---  " + getHMS(sec);
	}
});

ee3.on("timeupdate", function(sec) {
  voicetrackPlaySecond = sec;
  if (voicetrackPlaySecond > nextstart && recordstate === "playing" && rightTrackState === false) {
    rightTrackState = true;
    ee2.emit("play");	

    var curvolume = localStorage.miclevel || 80;
    var fadeAudio = setInterval(function () {
        if (curvolume > 0) {
          curvolume -= 20;
          ee1.emit("mastervolumechange", curvolume);
        } else {
          ee1.emit("stop");
          ee1.emit("mastervolumechange", 100);
          clearInterval(fadeAudio);
        }
    }, /*400*/fadetime * 1000 / 5);
  }
});

ee3.on("voicetrackblob", function(mp3file) {
  curVoiceTrackFullPath = "Music/Tracks/" + mp3file.name;
  extractedFile.file(curVoiceTrackFullPath, mp3file);
  extractedFile.remove(plsFileFullName);
  extractedFile.file(plsFileFullName, ComposePLS(mp3file.name));

  // var storageWoker = new Worker(URL.createObjectURL(new Blob([ localStorageWorker ], { type: "text/javascript" })));
  // extractedFile.generateAsync({type:"blob"})
  //   .then(function (content) {
  //     // storageWoker.postMessage({command: 'saveToLocalStorage', zipfile: content});//content can not be passed becuase it is a promise so can't clone it
  //     storageWoker.postMessage({command: 'saveToLocalStorage'});
  //     storageWoker.onmessage = function(e){
  //       if (e.data.cmd == 'startLocalSave') {
  //         // zFile = new File([content], "a.zip", {type: "application/zip"});
  //         content.arrayBuffer().then(buffer => {
  //           localStorage.setItem("storageFiles", JSON.stringify(buffer));
  //           console.log("saved local storag", JSON.stringify(buffer), buffer);
  //         });
  //       }
  //     };
  //   });
  
  ParsePLS(extractedFile);
  listUpdateState = false;
  SaveExtractedFileToIndexDB(false);  
  
  // console.log("receive", mp3file, extractedFile);
});

ee3.on("loaded", function(duration) {
  listUpdateState = false;
  var canvas = document.getElementById("recordform").getElementsByTagName("canvas")[0];
  canvas.addEventListener("mousedown", function( event ) {
    ee3.emit("seek", event.offsetX);
  }, false);

  curVoiceTrackLengthSecond = duration;
  // var canvasdiv = document.getElementById("form2");
  // canvasdiv.innerText = curTrackName2;
  // canvasdiv.innerText += "\n";
  // canvasdiv.innerText += getHMS(curTrackLengthSeconds2);
});

ee3.on("finished", function() {
  ee2.emit("mastervolumechange", 100); ///WP 11/22
  if (vtStart === 10000)
    ee2.emit("play");
});

ee3.on("audiometer", function(meter) {
  audioMeter = meter;

  // for (var i = 1; i <= 10; i++) {
  //   if (sampleSplitter[i])
  //   sampleSplitter[i].connect(audioMeter);
  // }
});

localStorageWorker_func = function() {
  this.onmessage = function(e){
    switch(e.data.command){
      case 'saveToLocalStorage':
        saveToLocalStorage(e.data.zipfile, e.data.localStorage);
        this.postMessage({cmd: "startLocalSave"});
        break;
      // case 'record':
      //   record(e.data.buffer);
      //   break;
      // case 'clear':
      //   clear();
      //   break;
    }
  };

  function saveToLocalStorage(file, localStorage){
    console.log("in worker", file);
    // localStorage.setItem("storageFiles", JSON.stringify(file));
  }
}

localStorageWorker = localStorageWorker_func.toString().trim().match(
	/^function\s*\w*\s*\([\w\s,]*\)\s*{([\w\W]*?)}$/
)[1];

// Replace the record function
function record() {
  if (recordstate === "stopped") {
    // Initialize recording
    if (!window.voiceTrackRecorder) {
      alert("Microphone not initialized. Please check microphone access.");
      return;
    }
    
    // Reset state
    recordstate = "recording";
    rightTrackState = false;
    
    // Start recording
    window.voiceTrackRecorder.start();
    
    // Start playback of first track
    playlist1.play();
    
    // Update UI
    document.getElementById("recordbtn").innerHTML = "Stop";
    document.getElementById("recordbtn").style.backgroundColor = "red";
  } else {
    // Stop recording
    recordstate = "stopped";
    rightTrackState = false;
    
    // Stop recording
    window.voiceTrackRecorder.stop();
    
    // Stop playback
    playlist1.stop();
    playlist2.stop();
    
    // Update UI
    document.getElementById("recordbtn").innerHTML = "Record";
    document.getElementById("recordbtn").style.backgroundColor = "#4CAF50";
  }
}

// Replace the play function
function play() {
  if (recordstate === "stopped") {
    // Start playback
    recordstate = "playing";
    rightTrackState = false;
    
    // Play voice track
    playlist3.play();
    
    // Update UI
    document.getElementById("playbtn").innerHTML = "Stop";
    document.getElementById("playbtn").style.backgroundColor = "red";
  } else {
    // Stop playback
    recordstate = "stopped";
    rightTrackState = false;
    
    // Stop all tracks
    playlist1.stop();
    playlist2.stop();
    playlist3.stop();
    
    // Update UI
    document.getElementById("playbtn").innerHTML = "Play";
    document.getElementById("playbtn").style.backgroundColor = "#4CAF50";
  }
}

// Function to load a track into WaveSurfer
function loadTrackIntoWaveSurfer(wavesurfer, file, trackName) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }
    
    // If file is a string (URL), load it directly
    if (typeof file === 'string') {
      wavesurfer.load(file);
      wavesurfer.on('ready', () => {
        resolve(wavesurfer.getDuration());
      });
      wavesurfer.on('error', err => {
        reject(err);
      });
      return;
    }
    
    // If file is a Blob or File object, load it
    if (file instanceof Blob) {
      wavesurfer.loadBlob(file);
      wavesurfer.on('ready', () => {
        resolve(wavesurfer.getDuration());
      });
      wavesurfer.on('error', err => {
        reject(err);
      });
      return;
    }
    
    // If file is an ArrayBuffer, decode it first
    if (file instanceof ArrayBuffer) {
      const audioContext = new AudioContext();
      audioContext.decodeAudioData(file)
        .then(buffer => {
          wavesurfer.loadDecodedBuffer(buffer);
          resolve(buffer.duration);
        })
        .catch(err => {
          reject(err);
        });
      return;
    }
    
    reject(new Error('Unsupported file type'));
  });
}

// Function to mark the next start point
function markNextStart() {
  if (recordstate === "playing") {
    nextstart = voicetrackPlaySecond;
    
    // Update the MP3 tag with the new next start point
    extractedFile.forEach(function(relPath, file) {
      if (relPath.endsWith(curVoiceTrackFile)) {
        file.async('blob').then(function(content) {
          content.arrayBuffer().then(buffer => {
            ResetMp3tag(buffer);
            updateNextStart();
          });
        });
      }
    });
    
    // Add a visual marker in WaveSurfer
    const regions = playlist3.regions.getRegions();
    
    // Remove existing next start markers
    Object.values(regions).forEach(region => {
      if (region.data && region.data.type === 'nextstart') {
        region.remove();
      }
    });
    
    // Add new marker
    playlist3.regions.addRegion({
      start: nextstart,
      end: nextstart + 0.1,
      color: 'rgba(0, 0, 255, 0.5)',
      data: {
        type: 'nextstart'
      }
    });
  }
}

// Function to mark the intro point
function markToIntro() {
  if (recordstate === "playing") {
    nextstart = curVoiceTrackLengthSecond - intromark;
    
    if (nextstart < 0) {
      nextstart = 0;
    }
    
    extractedFile.forEach(function(relPath, file) {
      if (relPath.endsWith(curVoiceTrackFile)) {
        file.async('blob').then(function(content) {
          content.arrayBuffer().then(buffer => {
            ResetMp3tag(buffer);
            updateNextStart();
          });
        });
      }
    });
    
    // Add a visual marker in WaveSurfer
    const regions = playlist3.regions.getRegions();
    
    // Remove existing intro markers
    Object.values(regions).forEach(region => {
      if (region.data && region.data.type === 'intro') {
        region.remove();
      }
    });
    
    // Add new marker
    playlist3.regions.addRegion({
      start: nextstart,
      end: nextstart + 0.1,
      color: 'rgba(0, 255, 0, 0.5)',
      data: {
        type: 'intro'
      }
    });
  }
}


