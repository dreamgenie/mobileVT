var modal_mic = document.getElementById("micsetting");
var closediv = document.getElementById("mdiv");

function micsetting() {
  closeMenu();
  modal_mic.style.display = "block";
  var rangeEl = document.getElementById("micvolume");
  var valuetext = document.getElementById("valuetext");
  if (localStorage.miclevel) {
    rangeEl.value = localStorage.miclevel;
    valuetext.innerText = localStorage.miclevel;
    //ee3.emit("micvolumechange", localStorage.miclevel);
  }
}

var fadeElement = document.getElementById("tentacles");
fadeElement.value = fadetime;

closediv.addEventListener('click', function (event) {
  modal_mic.style.display = "none";
  localStorage.fadetime = fadeElement.value;
  fadetime = fadeElement.value;
});

function speakerselection() {
  var x = document.getElementById("speakerlist");
  var i = x.selectedIndex;
  // console.log("select combobox", x.options[i].text + x.value + x.selectedIndex);
}

var inputAudioList = [];

function micselection() {
  var x = document.getElementById("miclist");
  var i = x.selectedIndex;
  startUserMedia(inputAudioList[i]);
  // console.log("select combobox", inputAudioList[i]);
}

function refresh() {
  console.log("refresh");
}

var slider = document.getElementById("ducking");
var output = document.getElementById("db");
output.innerHTML = slider.value = ducking;


slider.oninput = function() {
  output.innerHTML = this.value;
  ducking = this.value;
  localStorage.ducking = ducking;
}

navigator.mediaDevices.enumerateDevices()
  .then(gotDevices)
  .catch(errorCallback);

function gotDevices(deviceInfos) {
  for (var i = 0; i !== deviceInfos.length; ++i) {
    var deviceInfo = deviceInfos[i];
    var option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'audioinput') {
      var mic = document.getElementById('miclist');
      option.text = deviceInfo.label ||'Microphone ' + (mic.length + 1);
      mic.appendChild(option);
      inputAudioList.push(deviceInfo.deviceId);
    } else if (deviceInfo.kind === 'audiooutput') {
      var speaker = document.getElementById('speakerlist');
      option.text = deviceInfo.label || 'Speaker ' + (speaker.length + 1);
      speaker.appendChild(option);
    }
  }
  if (inputAudioList.length > 0) {
    var out = localStorage.savedPlaybackDevice;
    var idx = inputAudioList.indexOf(out);
    if (idx > -1) {
      mic.selectedIndex = idx;
      startUserMedia(out);
    }
    else {
      startUserMedia(inputAudioList[0]);
    }
  }
  else
    alert("Can't find any audio input device!");
}

function errorCallback(error) {
    console.log("error", error);
}