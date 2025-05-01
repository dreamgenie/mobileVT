function showsample() {
    closeMenu();
    var waveform = document.getElementById("playlistview");	
	var samplebuttons = document.getElementById("samplebutons");    	 	
			
	if ( goLiveState) //WP Golive
	{
		waveform.style.transition =" 0.4s ease-in";
		samplebuttons.style.top = waveform.offsetTop + "px";
		waveform.style.width = "calc(100% - 220px)";
		samplebuttons.style.height = "calc(100% - 225px)";
	} 
	else
	{ 
		waveform.style.transition =" 0.4s ease-in";		
		samplebuttons.style.top = waveform.offsetTop + "px";	
		waveform.style.width = "calc(100% - 220px)";	
		samplebuttons.style.height = "calc(70%)";		
	}	
	
	if (window.isMobile() == true)
	{
		samplebuttons.style.right = "0px";		
	}
	samplebuttons.style.display = "block";			
}

function closeSampleButtons() {
    document.getElementById("samplebutons").style.display = "none";
	document.getElementById("playlistview").style.width = "calc(100% - 15px)";//WP goLive
	
}

// const sampleAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
var sampleGainNode = [];
// var sampleSplitter = [];
var fadeOut = [];

for (var i = 1; i <= 10; i++) {
    sampleGainNode[i] = sampleAudioCtx.createGain();
    sampleGainNode[i].gain.value = saveSampleVoulume / 100.0;
    sampleGainNode[i].connect(sampleAudioCtx.destination);
    //sampleGainNode[i].connect(sampleMixer);
}

const audiosource = [];
var sampleMusicBufferList = [];
var sampleMusicPayStatus = [];
var sampleMusicTimer = [];
var sampleMusicElapsedTime = [];
var sampleMusicFileName = [];

(function () {
    for (var i = 1; i <= 10; i++) {
        audiosource[i] = null;
        sampleMusicBufferList[i] = null;
        sampleMusicPayStatus[i] = false;
        sampleMusicTimer[i] = null;
        sampleMusicElapsedTime[i] = 0;
        sampleMusicFileName[i] = null;
		fadeOut[i] = false;
    }

    var samplevolume = document.getElementById("samplevolume");
    var samplevolval = document.getElementById("samplevolval");
    samplevolume.value = saveSampleVoulume;
    samplevolval.innerHTML = saveSampleVoulume;
  
    if (isOlderEdgeOrIE()) {
      samplevolume.style.height = "20px";
      samplevolume.addEventListener("change", function(e) {
        samplevolval.innerHTML = e.target.value;
        // ee3.emit(emitter, e.target.value);
        for (var i = 1; i <= 10; i++) {
            sampleGainNode[i].gain.value = e.target.value / 100.0;
        }
        localStorage.saveSampleVoulume = e.target.value;
      });
      samplevolume.addEventListener("input", function(e) {
        samplevolval.innerHTML = e.target.value;
        // ee3.emit(emitter, e.target.value);
        for (var i = 1; i <= 10; i++) {
            sampleGainNode[i].gain.value = e.target.value / 100.0;
        }
        localStorage.saveSampleVoulume = e.target.value;
      });
    } else {
      updateRangeEl(samplevolume);
      samplevolume.addEventListener("input", function(e) {
        updateRangeEl(e.target);
        samplevolval.innerHTML = e.target.value;
        // ee3.emit(emitter, e.target.value);
        for (var i = 1; i <= 10; i++) {
            sampleGainNode[i].gain.value = e.target.value / 100.0;
        }
        localStorage.saveSampleVoulume = e.target.value;
      });
    }
})();

function SampleButtonClicked(idx, btn) {
    if (isDeleteMode == true) {
        if (sampleMusicBufferList[idx] != null) {
            if (sampleMusicPayStatus[idx] == true) {
                audiosource[idx].stop();
                sampleMusicPayStatus[idx] = false;
                if (sampleMusicTimer[idx] !== null) {
                    clearInterval(sampleMusicTimer[idx]);
                    sampleMusicTimer[idx] = null;
                    sampleMusicElapsedTime[idx] = 0;
                }
            }
            sampleMusicBufferList[idx] = null;
            btn.innerHTML = "empty";
        }

        deleteSampleMusicInDb("empty" + idx);

        isDeleteMode = false;
        subject.innerText = zipFileName;//"NextKast MobileVT";
        deletemenu.innerText = "Delete Item"
        subject.style.backgroundColor = "rgb(210, 210, 210)";
        return;
    }

    if (sampleMusicBufferList[idx] == null) {
        let input = document.createElement('input');
        input.type = 'file';
        input.accept = ".mp3"
        input.onchange = _ => {
          let files = Array.from(input.files);
          btn.innerHTML = files[0].name;
          sampleMusicFileName[idx] = files[0].name;
          GetAudioArrayBuffer(files[0], idx);
          putSampleMusicInDb("empty" + idx, files[0]);
        //   micselection();
        };
        input.click();
    } else {
        if (sampleMusicPayStatus[idx] == false) {
			
			//WP
			if (fadeOut[idx] == true){
				audiosource[idx].stop();
				sampleGainNode[idx].disconnect(sampleMixer);//WP
				fadeOut[idx] = false;
				clearInterval(sampleMusicTimer[idx]);
				sampleMusicTimer[idx] = null;
				sampleMusicElapsedTime[idx] = 0;				
			}
			
            audiosource[idx] = sampleAudioCtx.createBufferSource();
            audiosource[idx].buffer = sampleMusicBufferList[idx];
			sampleGainNode[idx].gain.value = samplevolume.value / 100;//WP
			sampleGainNode[idx].connect(sampleMixer);//WP
            audiosource[idx].connect(sampleGainNode[idx]);			
            audiosource[idx].start();
            sampleMusicPayStatus[idx] = true;
            sampleMusicTimer[idx] = setInterval(showPlayingTime, 75, audiosource[idx].buffer.duration, idx, btn);
			btn.style.background = "linear-gradient(rgb(0, 128, 0), rgb(0, 64, 0))"; //WP goLive			
        }
        else {
			fadeOut[idx] = true;
            //audiosource[idx].stop();
			//sampleGainNode[idx].disconnect(sampleMixer);//WP			
            //sampleMusicPayStatus[idx] = false;
            //if (sampleMusicTimer[idx] !== null) {
                //clearInterval(sampleMusicTimer[idx]);
                //sampleMusicTimer[idx] = null;
                //sampleMusicElapsedTime[idx] = 0;
            //}
            //btn.innerHTML = sampleMusicFileName[idx];
        }
    }
}

function showPlayingTime(duration, idx, btn) {
    sampleMusicElapsedTime[idx] += 0.075;
    var timetext = getHMS(duration - sampleMusicElapsedTime[idx]);
	///WP GoLive
	if((duration - sampleMusicElapsedTime[idx]) >= 0 ){
		btn.innerHTML = sampleMusicFileName[idx].replace(/\..+$/, '') + "<br>" + timetext;
	}
	else
	{
		btn.innerHTML = sampleMusicFileName[idx].replace(/\..+$/, '')
		clearInterval(sampleMusicTimer[idx]);
		audiosource[idx].stop();
		sampleGainNode[idx].disconnect(sampleMixer);//WP
		sampleMusicPayStatus[idx] = false;
		sampleMusicTimer[idx] = null;
        sampleMusicElapsedTime[idx] = 0;		
		btn.style.background = "linear-gradient(rgb(54, 54,54), rgb(30, 30, 30))"; //WP goLive	
	}
    // var reclbl = document.getElementById("recordlabel");
    // reclbl.innerHTML = "Press HERE to Stop Recording<br>" + timetext;
	
	//WP
	if (fadeOut[idx] == true){
		sampleGainNode[idx].gain.value = sampleGainNode[idx].gain.value - (sampleGainNode[idx].gain.value/6);	///based on level 05/04/23
	 	if(sampleGainNode[idx].gain.value < .001)	{//lowered to .01 from .001 05/04/23
			audiosource[idx].stop();
			sampleGainNode[idx].disconnect(sampleMixer);//WP
			fadeOut[idx] = false;
			sampleMusicPayStatus[idx] = false;
			clearInterval(sampleMusicTimer[idx]);
            sampleMusicTimer[idx] = null;
            sampleMusicElapsedTime[idx] = 0;
			btn.innerHTML = sampleMusicFileName[idx].replace(/\..+$/, ''); 
			btn.style.background = "linear-gradient(rgb(54, 54,54), rgb(30, 30, 30))"; //WP goLive	
		}
	}
}

function GetAudioArrayBuffer(file, idx) {
    var reader = new FileReader();

    reader.onload = function (event) {
        sampleAudioCtx.decodeAudioData(event.target.result, function(buffer) {
                sampleMusicBufferList[idx] = buffer;
            }, function(e){ console.log("Error with decoding audio data" + e.err);
        });
    };

    // In case that the file couldn't be read
    reader.onerror = function (event) {
        console.error("An error ocurred reading the file: ", event);
    };
    
    // Read file as an ArrayBuffer, important !
    reader.readAsArrayBuffer(file);
}


////golive WP 11/24
function fadeOutAllActiveSamples()
{	
	for (var i = 1; i <= 10; i++) 
		{	
			if (sampleMusicPayStatus[i] == true)
				{
					fadeOut[i] = true;			
				}
		}
}		
////golive WP 11/24

