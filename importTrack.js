
var importDialog = document.getElementById("importDialogModal");
var closediv = document.getElementById("iclose");
var importPlayer;
var importTrackName;
var importTrackPath;
var importNextStartMark =0;
var importIntroMark=0;
var importOutroMark=0;
var importTrackStartsMark=0;
var currentImportPlayPosition;
var currentCategory;

function importTrack(category = '') {
  closeMenu();
  importDialog.style.display = "block";
  clearImportPlayer();  
  returnCategoryList(document.getElementById("importCategoryList"));//WP 11/22
  currentCategory = category;
  if (goLiveState == true)//032423 WP ==
  {
	  var vidstream = document.getElementById("stream");
	  vidstream.muted = true;
  }
}

closediv.addEventListener('click', function (event) {
  importDialog.style.display = "none";
  editWaveFormEvent.emit("clear");
  if (goLiveState == true)//032423 WP ==
  {
	  var vidstream = document.getElementById("stream");
	  vidstream.muted = false;
  }
});

importPlayer = WaveformPlaylist.init({
  samplesPerPixel: 5000,
  waveHeight: 200, //document.getElementById("newImportTrack").clientHeight + 2,
  container: document.getElementById("newImportTrack"),
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
  waveWidth: document.getElementById("newImportTrack").clientWidth  
});


var editWaveFormEvent = importPlayer.getEventEmitter();

function selectTrack(){
	clearImportPlayer();
	let input = document.createElement("input");
	input.type = "file";
	input.setAttribute("multiple", true);
	input.setAttribute("accept", "audio/*");
	input.onchange = function (event) {
    //
		console.log(this.files);
		const curFiles = this.files;		
		editWaveFormEvent.emit("newtrack", curFiles[0], "test Name", document.getElementById("newImportTrack").clientWidth);
		importTrackName = curFiles[0].name;
		importTrackPath = curFiles[0]
		document.getElementById("importCart").value = importTrackName;
	};
	input.click();
	
	
}

function clearImportPlayer(){
	
		editWaveFormEvent.emit("removeTrack", importTrackName);
		editWaveFormEvent.emit("clear");
		
		var btn = document.getElementById("importNextStartBtn");
		importNextStartMark =0;
		btn.innerHTML = getHMS(importNextStartMark) + "<br>" + "Next Start";		
	
		var btn = document.getElementById("importTrackStartBtn");
		importTrackStartsMark=0;	
		btn.innerHTML = getHMS(importTrackStartsMark) + "<br>" + "Track Starts";
		
		var btn = document.getElementById("importIntroUntilBtn");
		importIntroMark =0;
		btn.innerHTML = getHMS(importIntroMark) + "<br>" + "Intro Until";
		
		var btn = document.getElementById("importOutroStartsBtn");
		importOutroMark = 0;
		btn.innerHTML = getHMS(importOutroMark) + "<br>" + "Outro Starts";	
		
		document.getElementById("importCart").value = "";
		document.getElementById("importTitle").value = "";
		document.getElementById("importArtist").value = "";
		document.getElementById("importGenre").value = "";
	
}

function playImportFile(){
	var btn = document.getElementById("importplaybtn");
	if (importPlayer.isPlaying() == true){
		editWaveFormEvent.emit("stop", 0)      
        btn.classList.remove("stop-btn");
        btn.classList.add("play-btn");
		btn.innerText = "Play"
	}
	else{
		editWaveFormEvent.emit("play", 0);
        btn.classList.remove("play-btn");
        btn.classList.add("stop-btn");
		btn.innerText = "Stop"
	}	
}

function importMarkNextStart(){	
	var btn = document.getElementById("importNextStartBtn");
	importNextStartMark = currentImportPlayPosition;
	btn.innerHTML = getHMS(importNextStartMark) + "<br>" + "Next Start";
	editWaveFormEvent.emit('addmark', 0, importNextStartMark);	
}

function importMarkIntroUntil(){
	var btn = document.getElementById("importIntroUntilBtn");
	importNextStartMark = currentImportPlayPosition;
	importIntroMark = currentImportPlayPosition;
	btn.innerHTML = getHMS(importIntroMark) + "<br>" + "Intro Until";
	editWaveFormEvent.emit('addmark', importIntroMark, 0);	
}

function importMarkOutroStarts(){
	var btn = document.getElementById("importOutroStartsBtn");
	importOutroMark = currentImportPlayPosition;
	btn.innerHTML = getHMS(importOutroMark) + "<br>" + "Outro Starts";
	editWaveFormEvent.emit('outroStart', importOutroMark);	
}

function importTrackStarts(){
	var btn = document.getElementById("importTrackStartBtn");
	importTrackStartsMark = currentImportPlayPosition;
	btn.innerHTML = getHMS(importTrackStartsMark) + "<br>" + "Track Starts";
	editWaveFormEvent.emit('trackStart', importTrackStartsMark);	
}

function importMarkTest(theType, back){

	switch(theType) {
	  case 'start':
		if (back != 0){importTrackStartsMark += back;};	
		editWaveFormEvent.emit('select', importTrackStartsMark, 0, '');
		editWaveFormEvent.emit('trackStart', importTrackStartsMark);	
		var btn = document.getElementById("importTrackStartBtn");
		btn.innerHTML = getHMS(importTrackStartsMark) + "<br>" + "Track Starts";
		break;
	  case 'intro':
		if (back != 0){importIntroMark += back;};
		editWaveFormEvent.emit('select', importIntroMark, 0, '');
		editWaveFormEvent.emit('addmark', importIntroMark, 0);
		var btn = document.getElementById("importIntroUntilBtn");	
		btn.innerHTML = getHMS(importIntroMark) + "<br>" + "Intro Until";		
		break;
	  case 'outro':
		if (back != 0){importOutroMark += back;};
		editWaveFormEvent.emit('select', importOutroMark, 0, '');
		editWaveFormEvent.emit('addmark', 0,importOutroMark);
		var btn = document.getElementById("importOutroStartsBtn");	
		btn.innerHTML = getHMS(importOutroMark) + "<br>" + "Outro Starts";	
		break;
	  case 'nextstart':  
		if (back != 0){importNextStartMark += back;};
		editWaveFormEvent.emit('select', importNextStartMark, 0, '');
		editWaveFormEvent.emit('nextstart', importNextStartMark, 0);
		var btn = document.getElementById("importNextStartBtn");	
		btn.innerHTML = getHMS(importNextStartMark) + "<br>" + "Next Start";	
		break;	
	}
}

function importUpload(){
	//editWaveFormEvent.emit('initExporter');
	//editWaveFormEvent.emit('startaudiorendering','wav');	
	//newName = importTrackPath.split('.').pop();	
	uploadOTW(importTrackName);
	UploadFileToServer(importTrackPath);	
}

function UploadFileToServer(file){
  var spinprogress = document.getElementById("spinprogress");
  spinprogress.style.display = "block";
  var req = new XMLHttpRequest();
  req.open('POST', GetServeUrl() + '/fileSender', true);
  // req.responseType = 'blob'; //<- returns the raw-response-content as a JavaScript-Blob-Object (createObjectURL expects a BLOB-object as a param)
  req.send(file);
  req.onload = function() {
    spinprogress.style.display = "none";
    //alert("Uploading VT Job Succeeded");
    conn_modal.style.display = "none";
    alert(req.responseText);
	clearImportPlayer();		
  }
}

function uploadOTW(fname){
  var oJSON = {};
  oJSON.MethodName = 'UploadOTW';
  oJSON.User = username.value;
  oJSON.PW = password.value;
  oJSON.fileNameOTW = fname;
  oJSON.Cart = document.getElementById("importCart").value;
  oJSON.Title = document.getElementById("importTitle").value;
  oJSON.Artist = document.getElementById("importArtist").value;
  oJSON.Genre = document.getElementById("importGenre").value;
  oJSON.Category = document.getElementById("importCategoryList").value;
  
  oJSON.startNextRaw = importNextStartMark;
  oJSON.introRaw = importIntroMark;
  oJSON.outroRaw = importOutroMark;
  oJSON.trackStartRaw = importTrackStartsMark;  
  
  oJSON.startNext = getHMS(importNextStartMark);
  oJSON.intro = getHMS(importIntroMark);
  oJSON.outro = getHMS(importOutroMark);
  oJSON.trackStart = getHMS(importTrackStartsMark);     
  
  var req = new XMLHttpRequest();
  req.open('POST', GetServeUrl() + '/jsonAjaxRPC', false);
  req.onload = function() {
	 if (req.responseText == '{"status":"busy"}')
		 {alert("Server is busy, please try again later");}
  }
  req.send(JSON.stringify(oJSON));  
  
}

function categoryChange()
{
	currentCategory = document.getElementById("importCategoryList").value;
}

function requestFileMetaData(fname)
{

	var oJSON = {};
	oJSON.MethodName = 'RequestFileMetaData';
	oJSON.User = username.value;
	oJSON.PW = password.value;  
	oJSON.File = fname;
   
  
  var req = new XMLHttpRequest();
  req.open('POST', GetServeUrl() + '/jsonAjaxRPC', false);
  req.onload = function() {
	  
	var meta = JSON.parse(req.response);	
	document.getElementById("importTitle").value = meta.Title;	
	document.getElementById("importArtist").value = meta.Artist;	 
	document.getElementById("importGenre").value= meta.Genre  

	importIntroMark = meta.intro;
	importMarkTest("intro",0)
	
    importOutroMark = meta.outro;	
	importMarkTest("outro",0)

	importNextStartMark = meta.startnext;
	importMarkTest("nextstart",0)
	editWaveFormEvent.emit('addmark', importIntroMark, importNextStartMark);
	
	importTrackStartsMark = meta.trackstart;
	importMarkTest("start",0)	
	
	    
  }
  
  req.send(JSON.stringify(oJSON));  
}


editWaveFormEvent.on("loaded", function(duration) { 
  var dur = document.getElementById("importDuration");
  dur.innerText = getHMS(duration);
  var canvas = document.getElementById("newImportTrack").getElementsByTagName("canvas")[0];
  document.getElementById("importCategoryList").value = currentCategory;
  requestFileMetaData(importTrackName);
  canvas.addEventListener("mousedown", function( event ) {
    editWaveFormEvent.emit("seek", event.offsetX);
  }, false);
  });
  
  editWaveFormEvent.on("timeupdate", function(sec) {
  var canvasdiv = document.getElementById("importTimeLabel");
  canvasdiv.innerText = getHMS(sec);
  currentImportPlayPosition = sec;
});

 editWaveFormEvent.on("audiorenderingfinished", function(type, data) {	
	//fileOTW('NewAudio.wav');	
	//SendFileToServer(importTrackName);
});

 editWaveFormEvent.on("audiorequeststatechange", function(state, src) {	
	//console.log(state);
	if (state == 1 ){		
		var dur = document.getElementById("importDuration");
		dur.innerText = 'Loading...';
		var canvasdiv = document.getElementById("importTimeLabel");
		canvasdiv.innerText = 'Loading...';
	}	
	});


