function display_c(){
  var refresh=1000; // Refresh rate in milli seconds
  mytime=setTimeout('display_ct()',refresh)
}

function display_ct() {
  var x = new Date().toLocaleTimeString();
  document.getElementById('time').innerHTML = x;
  var y = new Date().toDateString();
  document.getElementById('date').innerHTML = y;
  display_c();
}

function recording_time(btn) {
  elapsedTime += 0.1;
  var timetext = getHMS(elapsedTime);
  // btn.innerHTML = "Press HERE to Stop Recording<br>" + timetext;
  // btn.innerHTML += timetext;
  var reclbl = document.getElementById("recordlabel");
  reclbl.innerHTML = "Press HERE to Stop Recording:  " + timetext;
}
