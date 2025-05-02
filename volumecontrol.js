function isOlderEdgeOrIE() {
  return (
    window.navigator.userAgent.indexOf("MSIE ") > -1 ||
    !!navigator.userAgent.match(/Trident.*rv\:11\./) ||
    window.navigator.userAgent.indexOf("Edge") > -1
  );
}

function valueTotalRatio(value, min, max) {
  return ((value - min) / (max - min)).toFixed(2);
}

function getLinearGradientCSS(ratio, leftColor, rightColor) {
  return [
    '-webkit-gradient(',
    'linear, ',
    'left top, ',
    'right top, ',
    'color-stop(' + ratio + ', ' + leftColor + '), ',
    'color-stop(' + ratio + ', ' + rightColor + ')',
    ')'
  ].join('');
}

function updateRangeEl(rangeEl) {
  var ratio = valueTotalRatio(rangeEl.value, rangeEl.min, rangeEl.max);

  rangeEl.style.backgroundImage = getLinearGradientCSS(ratio, 'rgb(51, 102, 153)', 'rgb(30, 30, 30)');
}

function initMicVolume() {
  // var rangeEl = document.querySelector('input[type=range]');
  var rangeEl = document.getElementById("micvolume");
  if (localStorage.miclevel) {
    rangeEl.value = localStorage.miclevel;
    //ee3.emit("micvolumechange", localStorage.miclevel);
  }
  window.miclevel = rangeEl.value;
  // var textEl = document.querySelector('input[type=valuetext]');
  var valuetext = document.getElementById("valuetext");

  /**
   * IE/Older Edge FIX
   * On IE/Older Edge the height of the <input type="range" />
   * is the whole element as oposed to Chrome/Moz
   * where the height is applied to the track.
   *
   */
  if (isOlderEdgeOrIE()) {
    rangeEl.style.height = "20px";
    rangeEl.addEventListener("change", function(e) {
      valuetext.innerHTML = e.target.value;
      ee3.emit("micvolumechange", e.target.value);
      localStorage.miclevel = e.target.value;
    });
    rangeEl.addEventListener("input", function(e) {
      valuetext.innerHTML = e.target.value;
      ee3.emit("micvolumechange", e.target.value);
      localStorage.miclevel = e.target.value;
    });
  } else {
    updateRangeEl(rangeEl);
    rangeEl.addEventListener("input", function(e) {
      updateRangeEl(e.target);
      valuetext.innerHTML = e.target.value;
      ee3.emit("micvolumechange", e.target.value);
      localStorage.miclevel = e.target.value;
    });
  }
}

valuetext.innerHTML = 80;
initMicVolume();

function initEqSetting(rangeEle, valueEle, emitter) {
  // var eq1 = document.getElementById("eq1");
  // var eqval1 = document.getElementById("eqval1");

  if (isOlderEdgeOrIE()) {
    rangeEle.style.height = "20px";
    rangeEle.addEventListener("change", function(e) {
      valueEle.innerHTML = e.target.value;
      ee3.emit(emitter, e.target.value);
    });
    rangeEle.addEventListener("input", function(e) {
      valueEle.innerHTML = e.target.value;
      ee3.emit(emitter, e.target.value);
    });
  } else {
    updateRangeEl(rangeEle);
    rangeEle.addEventListener("input", function(e) {
      updateRangeEl(e.target);
      valueEle.innerHTML = e.target.value;
      ee3.emit(emitter, e.target.value);
    });
  }
}

function saveEqSetting() {
  localStorage.eqset1 = eqset1;
  localStorage.eqset2 = eqset2;
  localStorage.eqset3 = eqset3;
  localStorage.eqset4 = eqset4;
  localStorage.eqset5 = eqset5;

  console.log("saveEq", eqset1, eqset2, eqset3, eqset4, eqset5);
}

function saveCompressEq() {
  compressCheckState = document.getElementById("compression").checked;
  eqCheckState = document.getElementById("eqsettings").checked;
  localStorage.compressCheckState = compressCheckState? 1: 0;
  localStorage.eqCheckState = eqCheckState? 1: 0;

  console.log("savecom", localStorage.compressCheckState, localStorage.eqCheckState, compressCheckState, eqCheckState);
}

function initAllEqSetting() {
  var eq1 = document.getElementById("eq1");
  var eqval1 = document.getElementById("eqval1");
  eq1.value = eqset1;
  eqval1.innerHTML = eqset1;

  var eq2 = document.getElementById("eq2");
  var eqval2 = document.getElementById("eqval2");
  eq2.value = eqset2;
  eqval2.innerHTML = eqset2;

  var eq3 = document.getElementById("eq3");
  var eqval3 = document.getElementById("eqval3");
  eq3.value = eqset3;
  eqval3.innerHTML = eqset3;

  var eq4 = document.getElementById("eq4");
  var eqval4 = document.getElementById("eqval4");
  eq4.value = eqset4;
  eqval4.innerHTML = eqset4;

  var eq5 = document.getElementById("eq5");
  var eqval5 = document.getElementById("eqval5");
  eq5.value = eqset5;
  eqval5.innerHTML = eqset5;

  var compressionChk = document.getElementById("compression");
  var eqChk = document.getElementById("eqsettings");
  compressionChk.checked = compressCheckState;
  eqChk.checked = eqCheckState;

  // console.log("check state", compressionChk.checked, eqChk.checked);

  var modal_content = document.getElementById("modal-content");
  var eqdiv = document.getElementById("eqdiv");

  if (eqChk.checked == true) {
    modal_content.style.height = "440px";
    eqdiv.style.display = "block";
    //console.log("in eq check", modal_content.style.height, eqdiv.style.display, eqdiv.style);
  }
  else {
    modal_content.style.height = "290px";
    eqdiv.style.display = "none";
  }
  // micselection(); // diego 20221126: redundant

  initEqSetting(eq1, eqval1, "eqsetting1");
  initEqSetting(eq2, eqval2, "eqsetting2");
  initEqSetting(eq3, eqval3, "eqsetting3");
  initEqSetting(eq4, eqval4, "eqsetting4");
  initEqSetting(eq5, eqval5, "eqsetting5");
}

initAllEqSetting();

/**
 * Volume control functionality for WaveSurfer
 */

// Initialize volume controls
function initVolumeControls() {
  // Get volume sliders
  const track1Volume = document.getElementById('track1-volume');
  const track2Volume = document.getElementById('track2-volume');
  const vtVolume = document.getElementById('vt-volume');
  
  // Set initial values from localStorage or defaults
  track1Volume.value = localStorage.getItem('track1Volume') || 80;
  track2Volume.value = localStorage.getItem('track2Volume') || 80;
  vtVolume.value = localStorage.getItem('vtVolume') || 80;
  
  // Apply initial volumes
  if (playlist1) {
    playlist1.setVolume(track1Volume.value / 100);
  }
  
  if (playlist2) {
    playlist2.setVolume(track2Volume.value / 100);
  }
  
  if (playlist3) {
    playlist3.setVolume(vtVolume.value / 100);
  }
  
  // Add event listeners
  track1Volume.addEventListener('input', function() {
    if (playlist1) {
      playlist1.setVolume(this.value / 100);
    }
    localStorage.setItem('track1Volume', this.value);
  });
  
  track2Volume.addEventListener('input', function() {
    if (playlist2) {
      playlist2.setVolume(this.value / 100);
    }
    localStorage.setItem('track2Volume', this.value);
  });
  
  vtVolume.addEventListener('input', function() {
    if (playlist3) {
      playlist3.setVolume(this.value / 100);
    }
    localStorage.setItem('vtVolume', this.value);
  });
}

// Function to set volume for a specific player
function setVolume(player, volume) {
  if (!player) return;
  
  // Ensure volume is between 0 and 100
  volume = Math.max(0, Math.min(100, volume));
  
  // Set volume
  player.setVolume(volume / 100);
}

// Function to fade volume
function fadeVolume(player, startVolume, endVolume, duration, callback) {
  if (!player) return;
  
  // Ensure volumes are between 0 and 100
  startVolume = Math.max(0, Math.min(100, startVolume));
  endVolume = Math.max(0, Math.min(100, endVolume));
  
  // Convert to 0-1 range for WaveSurfer
  const startVol = startVolume / 100;
  const endVol = endVolume / 100;
  
  // Set initial volume
  player.setVolume(startVol);
  
  // Calculate step size
  const steps = 20; // Number of steps for the fade
  const stepTime = duration / steps;
  const volumeStep = (endVol - startVol) / steps;
  
  // Start fading
  let currentStep = 0;
  const fadeInterval = setInterval(() => {
    currentStep++;
    
    if (currentStep >= steps) {
      // Final step
      player.setVolume(endVol);
      clearInterval(fadeInterval);
      
      if (typeof callback === 'function') {
        callback();
      }
    } else {
      // Intermediate step
      const newVolume = startVol + (volumeStep * currentStep);
      player.setVolume(newVolume);
    }
  }, stepTime);
  
  // Return the interval ID for potential cancellation
  return fadeInterval;
}

// Initialize volume controls when the page loads
document.addEventListener('DOMContentLoaded', initVolumeControls);

