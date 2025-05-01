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

playlist1 = WaveformPlaylist.init({
  samplesPerPixel: 5000,
  waveHeight: 40,//document.getElementById("curform").clientHeight + 2,
  container: document.getElementById("curform"),
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
  waveWidth: document.getElementById("curform").clientWidth  
});

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

playlist3 = WaveformPlaylist.init({
  samplesPerPixel: 5000,
  waveHeight: 34,//document.getElementById("recordform").clientHeight,
  container: document.getElementById("recordform"),
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
  waveWidth: 288//document.getElementById("recordform").clientWidth
});

var ee1 = playlist1.getEventEmitter();
var ee2 = playlist2.getEventEmitter();
var ee3 = playlist3.getEventEmitter();

ee1.on("loaded", function(duration) {
  locked1 = false;
  var canvas = document.getElementById("curform").getElementsByTagName("canvas")[0];
  canvas.addEventListener("mousedown", function( event ) {
    ee1.emit("seek", event.offsetX);
  }, false);

  curTrackLengthSeconds1 = duration;
  var canvasdiv = document.getElementById("form1");
  canvasdiv.innerText = curTrackName1 + "  ---  " + getHMS(curTrackLengthSeconds1);
  canvasdiv.style.fontSize = "2.2vh";
  //canvasdiv.innerText += "\n";
  //canvasdiv.innerText += getHMS(curTrackLengthSeconds1);
});

ee1.on("finished", function() {
  if (recordstate === "playing" && vtStart === 10000)
    ee3.emit("play");
});

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
