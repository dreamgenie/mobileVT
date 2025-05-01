var conn_modal = document.getElementById("connection");
var con_cls = document.getElementById("connclose");
var radlocal = document.getElementById("local");
var radremote = document.getElementById("remote");
var username = document.getElementById("username");
var password = document.getElementById("password");

// function selection() {
//   conn_modal.style.display = "block";
// }
function InitConnectionDialog () {
  if (vtmode == "local")
    radlocal.checked = true;
  else
    radremote.checked = true;

  var ipaddress = document.getElementById("ipaddress");
  var port = document.getElementById("port");
  username.value = usernameSaved;
  password.value = passwordSaved;
  ipaddress.value = ipaddressSaved;
  port.value = portSaved;
}

function SaveConnectionDialog() {
  var ipaddress = document.getElementById("ipaddress");
  var port = document.getElementById("port");
  localStorage.username = username.value;
  localStorage.password = password.value;
  localStorage.ipaddress = ipaddress.value;
  localStorage.port = port.value;
}

InitConnectionDialog();

con_cls.addEventListener('click', function (event) {
  conn_modal.style.display = "none";
  SaveConnectionDialog();
});

function setProgress(elem, percent) {
  var
    degrees = percent * 3.6,
    transform = /MSIE 9/.test(navigator.userAgent) ? 'msTransform' : 'transform';
  elem.querySelector('.counter').setAttribute('data-percent', Math.round(percent));
  elem.querySelector('.progressEnd').style[transform] = 'rotate(' + degrees + 'deg)';
  elem.querySelector('.progress').style[transform] = 'rotate(' + degrees + 'deg)';
  if(percent >= 50 && !/(^|\s)fiftyPlus(\s|$)/.test(elem.className))
    elem.className += ' fiftyPlus';
}

function GetServeUrl() {
  var ipaddress = document.getElementById("ipaddress");
  
  ///WP to automatically get IP
  if (ipaddress.value == "" &&  (vtmode != "local"))
	ipaddress.value = window.location.host;

  //var port = document.getElementById("port"); //WP removed 11/22
  var url = 'http://' + ipaddress.value //+ ':' + port.value;

  if (ipaddress.value != "localhost")
  url = url.replace("http", "https");
  return url;
}

///added by WP to repopulate list of available jobs
function requestListIfLoggedIN(){
	if (username.value != '' && password.value != '' &&  GetServeUrl() != 'https://:' )
		RequestVTJobList();
}


function RequestVTJobList() {
  var requestBtn = document.getElementById("requestvtlist");
  if (requestBtn.innerHTML == "Request Available VT Jobs") {
    var oJSON = {};

    oJSON.MethodName = 'RequestVTJobList';
    oJSON.User = username.value;
    oJSON.PW = password.value;

    var req = new XMLHttpRequest();
    req.open('POST', GetServeUrl() + '/jsonAjaxRPC', true);
    req.onload = function() {
      var resJson = JSON.parse(req.response);
      var thelist = document.getElementById("thelist");
      while (thelist.firstChild)
        thelist.firstChild.remove();

      Object.keys(resJson).forEach(key => {
        var option = document.createElement('option');
        option.text = resJson[key];
        thelist.appendChild(option);
      });

      thelist.selectedIndex = 0;
    }
    req.send(JSON.stringify(oJSON));
    req.onerror = function() {
      alert("An error occurred during the connection");
      var thelist = document.getElementById("thelist");
      while (thelist.firstChild)
        thelist.firstChild.remove();
    }
  }
  else {// requestBtn.innerHTML == "Upload DONE VT Jobs"
  
  	//031323 WP
	if (extractedFile == undefined){
		alert ("Nothing to Send back, Please download new vtJob");	
		return;
	}	
	//031323 WP
  
    var eptNm = zipFileName + " DONE.zip";
    if(fileOTW(eptNm)) ///02/01/23
	{	
		exportVTDone();
		requestBtn.innerHTML = "Request Available VT Jobs";//WP
	}
  }
}

function RequestVTJob() {
  if (radlocal.checked == true)
    return;

  var thelist = document.getElementById("thelist");
  if (thelist.selectedIndex < 0) {
    alert("Please select vt job to request");
    return
  }

  var vtfilename = thelist.options[thelist.selectedIndex].text;
  var oJSON = {};
  oJSON.MethodName = 'RequestVTJob';
	oJSON.User = username.value;
	oJSON.PW = password.value;
	oJSON.vtJob = vtfilename;

  // var spinprogress = document.getElementById("spinprogress");
  // spinprogress.style.display = "block";

  var elem = document.querySelector('.circlePercent');
  elem.style.display = "block";

  var req = new XMLHttpRequest();
  req.open('POST', GetServeUrl() + '/jsonAjaxRPC', true);
  req.responseType = 'blob'; //<- returns the raw-response-content as a JavaScript-Blob-Object (createObjectURL expects a BLOB-object as a param)
  req.onload = function() {
    var unzip = new JSZip();
    unzip.loadAsync(req.response)
    .then(function(extracted) {
      extractedFile = extracted;
      ParsePLS(extracted);	  
      conn_modal.style.display = "none";
      SaveConnectionDialog();
      zipFileName = vtfilename.replace(".zip", "");
      elem.style.display = "none";
	  SaveExtractedFileToIndexDB(false);//WP
      setProgress(elem, 0);
    });

    oJSON.MethodName = "fileRecieved";
    var confirm = new XMLHttpRequest();
    confirm.open('POST', GetServeUrl() + '/jsonAjaxRPC', true);
    confirm.send(JSON.stringify(oJSON));
  };
  req.send(JSON.stringify(oJSON));
  req.onerror = function() {
    alert("An error occurred during the connection");
    elem.style.display = "none";
    setProgress(elem, 0);
  }
  req.addEventListener("progress", function(evt){
    if (evt.lengthComputable) {
      var percentComplete = evt.loaded / evt.total * 100;
      // console.log("Upload ", Math.round(percentComplete) + "% complete.");
      setProgress(elem, percentComplete);
    }
  });
}

function n(n){
  return n > 9 ? "" + n: "0" + n;
}

(function() {
  var datepicker = document.getElementById("datepicker");
  var cur = new Date();
  datepicker.value = n(cur.getFullYear()) + "-" + n(cur.getMonth() + 1) + "-" + n(cur.getDate()) + " " + n(cur.getHours()) + ":00:00";
})()

function RequestDayAndHour(thePicker = "datepicker") {
  var datepicker = document.getElementById(thePicker);
  var curdate = datepicker.value.split(" ")[0].split("-");
  var curhour = datepicker.value.split(" ")[1].split(":")[0];
  var oJSON = {};
  oJSON.MethodName = 'RequestPlaylist';
  oJSON.User = username.value;
	oJSON.PW = password.value;
	oJSON.date = curdate[1] + curdate[2] + curdate[0].substring(2);
	oJSON.Hour = curhour;
	

  //var req = new XMLHttpRequest();
  //req.open('POST', GetServeUrl() + '/jsonAjaxRPC', true);
  //  req.onload = function() {
  //  extractedFile = new JSZip();
  //  extractedFile.file("Playlist/" + oJSON.date + "/" + oJSON.Hour + ".pls", req.response);
  //  ParsePLS(extractedFile);
  
  //WP changed so that masterLibrary is returned as well
  var elem = document.querySelector('.circlePercent');
  elem.style.display = "block";  
  setProgress(elem, 0);
  
  var req = new XMLHttpRequest();
  req.open('POST', GetServeUrl() + '/jsonAjaxRPC', true);
  req.responseType = 'blob'; //<- returns the raw-response-content as a JavaScript-Blob-Object (createObjectURL expects a BLOB-object as a param)
  req.onload = function() {
    var unzip = new JSZip();
    unzip.loadAsync(req.response)
    .then(function(extracted) {
      extractedFile = extracted;
      ParsePLS(extracted);	  
    conn_modal.style.display = "none";
    SaveConnectionDialog();
    zipFileName = "VTJob-" + oJSON.date + "-" + oJSON.Hour + ".zip";
	SaveExtractedFileToIndexDB(false);//WP
 });  
 }
  req.send(JSON.stringify(oJSON)); 
  
  req.onerror = function() {
    alert("An error occurred during the connection");
    elem.style.display = "none";
    setProgress(elem, 0);
  }
  //WP messy could be improved
  req.addEventListener("progress", function(evt){
    if (evt.lengthComputable) {
      var percentComplete = evt.loaded / evt.total * 100;
      // console.log("Upload ", Math.round(percentComplete) + "% complete.");	  
      setProgress(elem, percentComplete);
	  if (Math.round(percentComplete) == 100){
		elem.style.display = "none";
		setProgress(elem, 0);
	  }
    }
  });
}

function RequestCurrentPlaylist() {
  console.log("Requesting current playlist...");  
  var datepicker = document.getElementById("datepicker");
  var curdate = datepicker.value.split(" ")[0].split("-");
  var curhour = datepicker.value.split(" ")[1].split(":")[0];
  
  //{"MethodName":"RequestCurrentPlaylist","User":"diego","PW":"password","date":"052922","Hour":"10"}
  var oJSON = {};
  oJSON.MethodName = 'RequestCurrentPlaylist';
  oJSON.User = username.value;
  oJSON.PW = password.value;
  oJSON.date = curdate[1] + curdate[2] + curdate[0].substring(2);
  oJSON.Hour = curhour;
  
  ///WP GoLive get updated hour from station
  oJSON.MethodName = 'RequestCurrentPlaylistJSON';
  var req1 = new XMLHttpRequest();
    req1.open('POST', GetServeUrl() + '/jsonAjaxRPC', false);
    req1.onload = function() {
      oJSON = JSON.parse(req1.response);
	  }
	req1.send(JSON.stringify(oJSON));

  oJSON.MethodName = 'RequestCurrentPlaylist';
  var req = new XMLHttpRequest();
  req.open('POST', GetServeUrl() + '/jsonAjaxRPC', true);
  req.responseType = 'blob'; //<- returns the raw-response-content as a JavaScript-Blob-Object (createObjectURL expects a BLOB-object as a param)
  req.onload = function() {
    var unzip = new JSZip();
    unzip.loadAsync(req.response).then(function(extracted) {
      extractedFile = extracted;
      ParsePLS(extracted);	
	  zipFileName = "VTJob-" + oJSON.date + "-" + oJSON.Hour + ".zip";
	  lastPlaylistHighLight = -1;
	  HighlightTracks(); ///wp 12/21/22
      //conn_modal.style.display = "none";
      //SaveConnectionDialog();
      //zipFileName = "VTJob-" + oJSON.date + "-" + oJSON.Hour + ".zip";
	  //SaveExtractedFileToIndexDB(false);//WP
    });  
  }
  req.send(JSON.stringify(oJSON)); 
  
  req.onerror = function() {
    alert("An error occurred during the connection");
    // elem.style.display = "none";
    // setProgress(elem, 0);
  }
}

function RequestTracks(mp3File1, mp3File2) {
  var oJSON = {};
  oJSON.MethodName = 'RequestTracks';
	oJSON.User = username.value;
	oJSON.PW = password.value;
	oJSON.track1 = mp3File1;
	oJSON.track2 = mp3File2;

  if (mp3File1 != "")
    locked1 = true;

  if (mp3File2 != "")
    locked2 = true;

  var elem = document.querySelector('.circlePercent');
  elem.style.display = "block";

  var req = new XMLHttpRequest();
  req.open('POST', GetServeUrl() + '/jsonAjaxRPC', true);
  req.responseType = 'blob';
  req.onload = function() {
    if (mp3File1 != "")
      locked1 = false;

    if (mp3File2 != "")
      locked2 = false;

    var unzip = new JSZip();
    unzip.loadAsync(req.response)
    .then(function(extracted) {
      extracted.forEach(function(relPath, file) {
		  
		relPath = relPath.split(".")[0];  
		  
        if (mp3File1 != "" && relPath.endsWith(mp3File1.split(".")[0]) ) { //modified && relPath.endsWith(mp3File1) caused non mp3 files not to work 061022 WP goLive
          locked1 = true;
          file.async('blob').then(function(content) {
            extractedFile.file("Music/Tracks/" + mp3File1, content);
            SaveExtractedFileToIndexDB(false);
            var blb_content = new Blob([content], { type: "audio" });
            ee1.emit("newtrack", blb_content, mp3File1, document.getElementById("curform").clientWidth);
            getMetaData(content, ee1);
          });
        }
  
        if (mp3File2 != "" &&  relPath.endsWith(mp3File2.split(".")[0]) ) { //modified && relPath.endsWith(mp3File2) caused non mp3 files not to work 061022 WP goLive
          locked2 = true;
          file.async('blob').then(function(content) {
            extractedFile.file("Music/Tracks/" + mp3File2, content);
            SaveExtractedFileToIndexDB(false);
            var blb_content = new Blob([content], { type: "audio" });
            ee2.emit("newtrack", blb_content, mp3File2, document.getElementById("nextform").clientWidth);
            getMetaData(content, ee2);
          });
        }
      });
    });
    elem.style.display = "none";
    setProgress(elem, 0);
	lastPlaylistHighLight = -1 //WP goLive update highlight flag
	
  };
  req.send(JSON.stringify(oJSON));
  req.onerror = function() {
    alert("An error occurred during the connection");

    if (mp3File1 != "")
      locked1 = false;

    if (mp3File2 != "")
      locked2 = false;

    elem.style.display = "none";
    setProgress(elem, 0);
  }
  req.addEventListener("progress", function(evt){
    if (evt.lengthComputable) {
      var percentComplete = evt.loaded / evt.total * 100;
      // console.log("Upload ", Math.round(percentComplete) + "% complete.");
      setProgress(elem, percentComplete);
    }
  });
}

function SendFileToServer(file){
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
	///WP 11/22	
	if (goLiveState == false){
    SaveConnectionDialog();
	var playlist = null;	
	var subject = document.getElementById("subject");//wp
	subject.innerText = "NextKast MobileVT";//wp
	deleteActiveVTJobInDb();//WP
	ShowPlayList(playlist); //wp
	}
	
	//indexedDB.deleteDatabase("vtjob");//wp
	//HighlightTracks() ;		
  }
  req.onerror = function() {
    spinprogress.style.display = "none";
    alert("Uploading VT Job Failed");
  }
}

function uploadProgress(evt) {
  if (evt.lengthComputable) {
    var percentComplete = evt.loaded / evt.total;
    // console.log("Upload ", Math.round(percentComplete*100) + "% complete.");
    console.log("total, current", evt.total, evt.loaded);
  }
}

function fileOTW(fname){
  var oJSON = {};
  oJSON.MethodName = 'FileOTW';
  oJSON.User = username.value;
	oJSON.PW = password.value;
  oJSON.fileNameOTW = fname;
  var req = new XMLHttpRequest();  
  req.open('POST', GetServeUrl() + '/jsonAjaxRPC',false);  ///,true //02/01/23
  req.send(JSON.stringify(oJSON));  
  
  //02/01/23/////////////////////////////////////  
  LJSON = JSON.parse(req.response);  
  if (LJSON['status'] == 'busy')
  {
	alert('Server Busy please try again in a moment');
	return false;
  }
  else{
	  return true;
  }
  //02/01/23//////////////////////  
}

function SaveExtractedFileToIndexDB(pause) {
	
var subject = document.getElementById("subject");//wp	

  extractedFile.generateAsync({type:"blob", compression: "DEFLATE", compressionOptions: {level: 1}})
  .then(function (content) {	
    putActiveVTJobInDb(content);
    putActiveVTJobNameInDb(zipFileName);	
	//subject.innerText = "Saved to Chache";
  });  
	  
}

function Disconnect() {
  console.log("disconnected");
}

var mod_modal = document.getElementById("modselection");
var mod_cls = document.getElementById("modclose");

function importSelection() {
  closeMenu();
  var requestBtn = document.getElementById("requestvtlist");
  requestBtn.innerHTML = "Request Available VT Jobs";
  mod_modal.style.display = "block";
}

mod_cls.addEventListener('click', function (event) {
  mod_modal.style.display = "none";
  if (radlocal.checked == true)
    localStorage.vtmode = "local";
  else
    localStorage.vtmode = "remote";
});

// radlocal.addEventListener('click', function() {
//   mod_modal.style.display = "none";
//   localStorage.vtmode = "local";

//   var isimport = document.getElementById("requestvtlist").innerHTML;
//   if (isimport == "Request Available VT Jobs")
//     importVT();
//   else
//     exportVT();
// });

// radremote.addEventListener('click', function() {
//   mod_modal.style.display = "none";
//   conn_modal.style.display = "block";
//   localStorage.vtmode = "remote";

//   var isimport = document.getElementById("requestvtlist").innerHTML;
//   if (isimport == "Request Available VT Jobs") {
//     var selectlist = document.getElementById("selectvtlist");
//     selectlist.style.display = "block";
//     var jobbtn = document.getElementById("requiestvtjob");
//     jobbtn.style.display = "block";
//   }
//   else {
//     var selectlist = document.getElementById("selectvtlist");
//     selectlist.style.display = "none";
//     var jobbtn = document.getElementById("requiestvtjob");
//     jobbtn.style.display = "none";
//   }
// });

function exportSelection() {
  closeMenu();
  var requestBtn = document.getElementById("requestvtlist");
  requestBtn.innerHTML = "Upload DONE VT Jobs";
  mod_modal.style.display = "block";

}