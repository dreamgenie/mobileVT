function importVT() {	
	
	//032123	
	 if (extractedFile != undefined){		
		if (confirm("Please Export Current VTjob Before you Import Next One") == true){
		return; }
	 }		 	 
    	
	closeMenu();
	requestListIfLoggedIN(); //WP
	
  if (locked1 === true || locked2 === true || listUpdateState === true)
    return;

  if (radlocal.checked == false) {
    var selectlist = document.getElementById("modal-content-connection");
    selectlist.style.height = "505px";
    var requestBtn = document.getElementById("requestvtlist");
    requestBtn.innerHTML = "Request Available VT Jobs";
    var selectlist = document.getElementById("selectvtlist");
    selectlist.style.display = "block";
    var jobbtn = document.getElementById("requiestvtjob");
    jobbtn.style.display = "block";
    var datepckr = document.getElementById("datepicker");
    datepckr.style.display = "block";
    var playlistbtn = document.getElementById("requestdayhour");
    playlistbtn.style.display = "block";
    var admindiv = document.getElementById("admindiv");
    admindiv.style.display = "block";
    conn_modal.style.display = "block";
    return;
  }

  let input = document.createElement('input');
  input.type = 'file';
  input.accept = ".zip"
  input.onchange = _ => {
    let files = Array.from(input.files);

    zipFileName = files[0].name.replace(".zip", "").replace(" DONE", "");
    var tmp = zipFileName.split("-");
    filedate = tmp[1] + tmp[2];
	
    var unzip = new JSZip();
    console.log("import", files);
    unzip.loadAsync(files[0])
    .then(function(extracted) {
      extractedFile = extracted;
      console.log("extracted", extracted);
      ParsePLS(extracted);	  
    });
  };
  input.click();
}

function ParsePLS(extracted) { 


  ///add later WP 02/2024 vtmode != "local"	
  getCanReorder(); //WP 07/2023
 	
  masterLibraryList = [];
  extracted.forEach(function(relPath, file) {
    if (relPath.endsWith(".pls")) {
      file.async('string').then(function(content) {
        var playlist = parse(content);
        displayedList = playlist;
        ShowPlayList(playlist.Items);
        plsFileFullName = relPath;
		console.log ("setting playlist file=" + relPath);
		var tmp = zipFileName.split("-");		
		tmp[2] = tmp[2].replace(".zip", "");
		//subject.innerText =  tmp[1] + " Hour: " + tmp[2] ; //wp		
		//wp go live show date string on subject div
		if ( goLiveState == false){
		const d = new Date(20+tmp[1].substring(4,7),tmp[1].substring(0,2)-1,tmp[1].substring(2,4),tmp[2],0,0,0);		
		globalDate =  new Date( d ); //WP GOLIVE
		subject.textContent =d.toDateString() + " " +  d.toLocaleTimeString();		
		}
      });
    }

    if (relPath.endsWith("masterLibraryRemote.txt")) {
      file.async('blob').then(function(content) {
        readMasterLibrary(content);
      });
    }	
  });
}

function dragstart(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function dragenter(ev) {
  ev.preventDefault();
  ev.target.parentNode.classList.add('row-drag-over');
}

function dragover(ev) {
  ev.preventDefault();
  ev.target.parentNode.classList.add('row-drag-over');
}

function dragleave(ev) {
  ev.target.parentNode.classList.remove('row-drag-over');
}

function drop(ev) {
	
try {  	
	  ev.target.parentNode.classList.remove('row-drag-over');

	  var sourceId = ev.dataTransfer.getData("text");
	  var targetRow = ev.target.parentNode;
	  // targetRow.parentNode.insertBefore(document.getElementById(sourceId), targetRow.nextSibling);
	  extractedFile.remove(plsFileFullName);
	  extractedFile.file(plsFileFullName, reorder(sourceId, targetRow.id));
	  ShowPlayList(displayedList.Items);
	  var dropID = Number(targetRow.id);
	  if (Number(targetRow.id) < Number(sourceId))
		dropID++;

	  if (goLiveState === true) //GoLive  WP
	  {
		var eptNm = zipFileName + " DONE.zip";
		fileOTW(eptNm);	
		exportVTDone();		
	  }

	  RowClicked(dropID); 
 
 } catch (error) {
  console.error(error);
}

}

function HighlightTracks() {
	//var playlistLength = displayedList.Items.length;
	//console.log("playlist length:", playlistLength);
	
	var table = document.getElementById("playlistview");
	var rows = table.rows;
	var pos = window.currentPlaylistPosition;
	var style;
	for(i = 1; i <= rows.length; i++) {
	  row = rows[i];	  
	  
	  //previous track
	  if (i == pos - 1) {
		style = "color: white; background-color: rgb(96, 0, 1)";	  	  		
	  }
	  
	  //playing track	
	  else	  
	  if(i == pos) {
	    style = "color: white; background-color: rgb(70, 130, 180)";		
	  }
	  
	  //next track
	  else	  
	  if (i == pos + 1) {
		style = "color: white; background-color: rgb(112, 112, 112)";
		//scroll row into view		
		if(row) row.scrollIntoView({behaviour: 'smooth', block: 'center', inline: 'nearest'}); ///WP changed to true 03/21/24
	  }
	  
	  //darken played tracks WP GoLive
	  else	  
	  if (i < pos-1 ) {
		style = "color: rgb(100,100,100) ; background-color: rgb(0, 0, 0)";
	  }
	  
      else	  
	  if (displayedList) {
	    var track = displayedList.Items[i - 1];
		if (track) style = "color: " + getRGB(track.TrackColor);
		// + ";background-color: " + "";
	  }
	  if (style) if (row) row.style = style;
	}	
	
	//scrollThisToTop(rows[pos]) ; WP Go Live
}

function scrollThisToTop(row) { //WP Go Live Does not work
  
  // Get the id of the row
  var myElement = row.id;
  
  // Get the variable for the top of the row
	var topPos = row.offsetTop;

  // The container div top to the row top
  document.getElementById('playlistview').scrollTop = topPos;
  
}

function ShowPlayList(playlist) {	 

  var totalTime = 0;
  var rowID = 0;
  var table = document.getElementById("playlistview");
  var headerItem = document.getElementById("firstrow");
  
  while (table.hasChildNodes()) {  
    table.removeChild(table.firstChild);
  }
  table.appendChild(headerItem);
  
  ///032123
  if (playlist == null) {
	  console.log("playlist Empty");
	  return;
	  }
  
  playlist.forEach(function(item) {
    var row = table.insertRow();
	
	row.style = "color: " + getRGB(item.TrackColor) + "; line-height: 27px; white-space:pre; outline: thin solid black; " ;
	
	if  (canReorder == true){ ///wp 07/2023
		row.draggable = "true";
		row.addEventListener('dragstart', dragstart);
		row.addEventListener('dragenter', dragenter)
		row.addEventListener('dragover', dragover);
		row.addEventListener('dragleave', dragleave);
		row.addEventListener('drop', drop);
	}
	
	//console.log("window.currentPlaylistPosition=",window.currentPlaylistPosition);
	
	//row.style = "color: " + getRGB(item.TrackColor) + "; line-height: 30px; white-space:pre ;" ;
	
	/*
	//previous track
	if (rowID == window.currentPlaylistPosition) {
		row.style="color: white; background-color: rgb(96, 0, 1)";
	//next track
	}if (rowID + 2 == window.currentPlaylistPosition) {
		row.style="color: white; background-color: rgb(112, 112, 112)";
	}
	//playing track
	if (rowID + 1 == window.currentPlaylistPosition) {
		row.style="color: white; background-color: rgb(70, 130, 180)";
	}
	*/
    row.id = rowID++;
    // row.style="color: rgb(255, 128, 0)";
    
	
    
	row.onclick = RowClicked;
	
	//11/22
	row.ondblclick = RowDoubleClicked;
	
    var cell = row.insertCell();
	cell.style = "font-size: 23px;"	
    
	
	//cell.innerHTML = item.TrackName;
	//08/29/23 WP	
	if (item.TrackName.includes("-"))
	{
		const words = item.TrackName.split('-');
		cell.innerHTML =    words[1].trim() + "\n" + "<font size=3>" + words[0].trim() + "</font>";
	}
	else
	{
		cell.innerHTML =  item.TrackName + "\n" + "<font size=3>" + item.Category + "</font>";	
	}
		
    cell = row.insertCell();
	cell.style = "font-size: 23px;"
    cell.innerHTML =  Number(item.IntroTime).toFixed() ;
    cell = row.insertCell();
	cell.style = "font-size: 23px;"
    cell.innerHTML =  getHMS(item.TrackLengthSeconds) ;
    cell = row.insertCell();
	cell.style = "font-size: 23px;"
	///08/31/23 WP
	if (Number(item.IntroTime) > 0 && item.TrackName.includes("VoiceTrack")){
		totalTime += Number(item.IntroTime); //store nextstart in VT for Duration
	}
	else{
		totalTime += Number(item.TrackLengthSeconds);
	}    
    cell.innerHTML = getHMS(totalTime.toString());
  });

  if (curID > -1) {
    curID = Number(curID) + 1;
    var row = document.getElementById(curID);
	
	///032123
	if( row != null)
	{
    row.style.backgroundColor = "rgb(0, 120, 215)";
	}
  }
  
  ///11.22
  if (goLiveState == true )
  {	
	table.scrollIntoView({behaviour: 'smooth', block: 'center', inline: 'nearest'});
	HighlightTracks(); ///WP 03/21/24
  }  

}

function parse (plsText) {
  var pls = {};

  // split into lines
  var Entries = plsText.split("\r\n");
  var rowCnt = Entries.length;

  if (Entries[0] != "[playlist]")
      return {listOk: false};

  pls.Count = GetValueFromFiled(Entries, 'NumberOfEntries');
  pls.Items = [];
  pls.curItem = 0;
  pls.listOk = true;

  for (var i = 1; i <= pls.Count; i++) {
      pls.Items.push( {
          File:               GetValueFromFiled(Entries, "File" + i),
          Sweeper:            GetValueFromFiled(Entries, "Sweeper" + i),
          Category:           GetValueFromFiled(Entries, "Category" + i),
          OverRideTime:       GetValueFromFiled(Entries, "OverRideTime" + i),
          TrackColor:         GetValueFromFiled(Entries, "TrackColor" + i),
          TrackName:          GetValueFromFiled(Entries, "TrackName" + i),
          TrackLengthSeconds: GetValueFromFiled(Entries, "TrackLengthSeconds" + i),
          OriginalFilePath:   GetValueFromFiled(Entries, "OriginalFilePath" + i),
          IntroTime:          GetValueFromFiled(Entries, "IntroTime" + i),
		  ///05/05/23
		  fillCategory:          GetValueFromFiled(Entries, "fillCategory" + i),
		  TrackArguments:          GetValueFromFiled(Entries, "TrackArguments" + i),
		  TrackNotes:          GetValueFromFiled(Entries, "TrackNotes" + i)
		  ///05/05/23
      });
	  
	  //WP 10/22 GoLive
	  if (pls.Items[i-1].TrackColor == 65535)
	  {
		 pls.Items[i-1].TrackName =  pls.Items[i-1].File;
	  }
	  
  }

  pls.Version = GetValueFromFiled(Entries, "Version");

  if (pls.Count != pls.Items.length)
      return {listOk: false};

  return pls;
}

function GetValueFromFiled(Entries, fieldname) {
  var entryCnt = Entries.length;
  for (var i = 1; i < entryCnt; i++)
    if (Entries[i].includes(fieldname))
      return Entries[i].split("=")[1];

  return "";
}

function ComposePLS(voiceTrackFileName) {
  var Entries = "[playlist]\r\n";

  var rowCnt = displayedList.Items.length;
  var rowIdx = 1;
  for (var i = 0; i < rowCnt; i++) {
    var item = displayedList.Items[i];
    Entries += "File" + rowIdx + "=" + item.File + "\r\n";
    Entries += "Sweeper" + rowIdx + "=" + item.Sweeper + "\r\n";
    Entries += "Category" + rowIdx + "=" + item.Category + "\r\n";
    Entries += "OverRideTime" + rowIdx + "=" + item.OverRideTime + "\r\n";
    Entries += "TrackColor" + rowIdx + "=" + item.TrackColor + "\r\n";
    Entries += "TrackName" + rowIdx + "=" + item.TrackName + "\r\n";
    Entries += "TrackLengthSeconds" + rowIdx + "=" + item.TrackLengthSeconds + "\r\n";
    Entries += "OriginalFilePath" + rowIdx + "=" + item.OriginalFilePath + "\r\n";
    Entries += "IntroTime" + rowIdx + "=" + item.IntroTime + "\r\n";
	///05/05/23
	Entries += "fillCategory" + rowIdx + "=" + item.fillCategory + "\r\n";
	Entries += "TrackArguments" + rowIdx + "=" + item.TrackArguments + "\r\n";
	Entries += "TrackNotes" + rowIdx + "=" + item.TrackNotes + "\r\n";
	///05/05/23
    rowIdx++;

    if (Number(curID) == i) {
      Entries += "File" + rowIdx + "=C:\\nextKastVT\\Music\\VoiceTracks\\" + voiceTrackFileName + "\r\n";
      Entries += "Sweeper" + rowIdx + "=False\r\n";
      Entries += "Category" + rowIdx + "=\r\n";
      Entries += "OverRideTime" + rowIdx + "=0\r\n";
      Entries += "TrackColor" + rowIdx + "=49152\r\n";
      Entries += "TrackName" + rowIdx + "=" + voiceTrackFileName.replace(".mp3", "") + "\r\n";
      Entries += "TrackLengthSeconds" + rowIdx + "=" + curVoiceTrackLengthSecond + "\r\n";
      Entries += "OriginalFilePath" + rowIdx + "=\r\n"; 
      Entries += "IntroTime" + rowIdx + "=" + nextstart + "\r\n"; ////08/31/23
	  ///05/05/23
	  Entries += "fillCategory" + rowIdx + "=" + item.fillCategory + "\r\n";
	  Entries += "TrackArguments" + rowIdx + "=" + item.TrackArguments + "\r\n";
	  Entries += "TrackNotes" + rowIdx + "=" + item.TrackNotes + "\r\n";
	  ///05/05/23
      rowIdx++;
    }
  }

  Entries += "NumberOfEntries=" + (rowIdx - 1) + "\r\n";
  Entries += "Version=2\r\n";

  return Entries;
}

function reorder(sourceId, targetId) {
  var newList = [];
  var rowCnt = displayedList.Items.length;
  var rowIdx = 0;

  for (var i = 0; i < rowCnt; i++) {
    if (Number(sourceId) == i)
      continue;

    newList[rowIdx++] = displayedList.Items[i];

    if (Number(targetId) == i) {
      newList[rowIdx++] = displayedList.Items[Number(sourceId)];
    }
  }

  displayedList.Items = newList;

  var Entries = "[playlist]\r\n";
  rowIdx = 1;
  for (var i = 0; i < rowCnt; i++) {
    var item = displayedList.Items[i];
    Entries += "File" + rowIdx + "=" + item.File + "\r\n";
    Entries += "Sweeper" + rowIdx + "=" + item.Sweeper + "\r\n";
    Entries += "Category" + rowIdx + "=" + item.Category + "\r\n";
    Entries += "OverRideTime" + rowIdx + "=" + item.OverRideTime + "\r\n";
    Entries += "TrackColor" + rowIdx + "=" + item.TrackColor + "\r\n";
    Entries += "TrackName" + rowIdx + "=" + item.TrackName + "\r\n";
    Entries += "TrackLengthSeconds" + rowIdx + "=" + item.TrackLengthSeconds + "\r\n";
    Entries += "OriginalFilePath" + rowIdx + "=" + item.OriginalFilePath + "\r\n";
    Entries += "IntroTime" + rowIdx + "=" + item.IntroTime + "\r\n";
	///05/05/23
	Entries += "fillCategory" + rowIdx + "=" + item.fillCategory + "\r\n";
	Entries += "TrackArguments" + rowIdx + "=" + item.TrackArguments + "\r\n";
	Entries += "TrackNotes" + rowIdx + "=" + item.TrackNotes + "\r\n";
	///05/05/23
    rowIdx++;
  }

  Entries += "NumberOfEntries=" + (rowIdx - 1) + "\r\n";
  Entries += "Version=2\r\n";

  return Entries;
}

function deleteplaylistitem(deleteID) {
  var newList = [];
  var rowCnt = displayedList.Items.length;
  var rowIdx = 0;

  for (var i = 0; i < rowCnt; i++) {
    if (Number(deleteID) != i)
      newList[rowIdx++] = displayedList.Items[i];
  }

  displayedList.Items = newList;

  var Entries = "[playlist]\r\n";
  rowIdx = 1;
  for (var i = 0; i < rowCnt - 1; i++) {
    var item = displayedList.Items[i];
    Entries += "File" + rowIdx + "=" + item.File + "\r\n";
    Entries += "Sweeper" + rowIdx + "=" + item.Sweeper + "\r\n";
    Entries += "Category" + rowIdx + "=" + item.Category + "\r\n";
    Entries += "OverRideTime" + rowIdx + "=" + item.OverRideTime + "\r\n";
    Entries += "TrackColor" + rowIdx + "=" + item.TrackColor + "\r\n";
    Entries += "TrackName" + rowIdx + "=" + item.TrackName + "\r\n";
    Entries += "TrackLengthSeconds" + rowIdx + "=" + item.TrackLengthSeconds + "\r\n";
    Entries += "OriginalFilePath" + rowIdx + "=" + item.OriginalFilePath + "\r\n";
    Entries += "IntroTime" + rowIdx + "=" + item.IntroTime + "\r\n";
	///05/05/23
	Entries += "fillCategory" + rowIdx + "=" + item.fillCategory + "\r\n";
	Entries += "TrackArguments" + rowIdx + "=" + item.TrackArguments + "\r\n";
	Entries += "TrackNotes" + rowIdx + "=" + item.TrackNotes + "\r\n";
	///05/05/23
    rowIdx++;
  }

  Entries += "NumberOfEntries=" + (rowIdx - 1) + "\r\n";
  Entries += "Version=2\r\n";

  return Entries;
}

function AddNewTrack(TrackName, Category, File, TrackLengthSeconds, IntroTime) {
  var Entries = "[playlist]\r\n";

  var rowCnt = displayedList.Items.length;
  var rowIdx = 1;
  for (var i = 0; i < rowCnt; i++) {
    var item = displayedList.Items[i];
    Entries += "File" + rowIdx + "=" + item.File + "\r\n";
    Entries += "Sweeper" + rowIdx + "=" + item.Sweeper + "\r\n";
    Entries += "Category" + rowIdx + "=" + item.Category + "\r\n";
    Entries += "OverRideTime" + rowIdx + "=" + item.OverRideTime + "\r\n";
    Entries += "TrackColor" + rowIdx + "=" + item.TrackColor + "\r\n";
    Entries += "TrackName" + rowIdx + "=" + item.TrackName + "\r\n";
    Entries += "TrackLengthSeconds" + rowIdx + "=" + item.TrackLengthSeconds + "\r\n";
    Entries += "OriginalFilePath" + rowIdx + "=" + item.OriginalFilePath + "\r\n";
    Entries += "IntroTime" + rowIdx + "=" + item.IntroTime + "\r\n";
	///05/05/23
	Entries += "fillCategory" + rowIdx + "=" + item.fillCategory + "\r\n";
	Entries += "TrackArguments" + rowIdx + "=" + item.TrackArguments + "\r\n";
	Entries += "TrackNotes" + rowIdx + "=" + item.TrackNotes + "\r\n";
	///05/05/23
    rowIdx++;

    if (Number(curID) == i) {
      Entries += "File" + rowIdx + "=" + File + "\r\n";
      Entries += "Sweeper" + rowIdx + "=False\r\n";
      Entries += "Category" + rowIdx + "=" + Category + "\r\n";
      Entries += "OverRideTime" + rowIdx + "=0\r\n";
      Entries += "TrackColor" + rowIdx + "=16777215\r\n";
      Entries += "TrackName" + rowIdx + "=" + TrackName + "\r\n";
      Entries += "TrackLengthSeconds" + rowIdx + "=" + TrackLengthSeconds + "\r\n";
      Entries += "OriginalFilePath" + rowIdx + "=\r\n";
      Entries += "IntroTime" + rowIdx + "=" + IntroTime + "\r\n";
	  ///05/05/23
	  Entries += "fillCategory" + rowIdx + "=" + item.fillCategory + "\r\n";
	  Entries += "TrackArguments" + rowIdx + "=" + item.TrackArguments + "\r\n";
	  Entries += "TrackNotes" + rowIdx + "=" + item.TrackNotes + "\r\n";
	  ///05/05/23
      rowIdx++;
    }
  }

  Entries += "NumberOfEntries=" + (rowIdx - 1) + "\r\n";
  Entries += "Version=2\r\n";

  return Entries;
}

function getRGB(bgrtext) {
  var bgr = Number(bgrtext);
  var r = 255 & bgr;
  var g = 255 & bgr >> 8;
  var b = 255 & bgr >> 16;
  var rgb = "rgb(" + r + "," + g + "," + b + ")";
  return rgb;
}

function getHMS(secondtext) {
  var seconds = Number(secondtext).toFixed(1);
  if (seconds < 0)
    seconds = 0;
  var dotDigit = seconds.toString();
  dotDigit = dotDigit.charAt(dotDigit.length-1);
  var hms = new Date(seconds * 1000).toISOString().substr(11, 8);
  return hms + "." + dotDigit;
}

function getVoiceTrackName() {
  var tmp = curTrackName1.slice(0, curTrackName1.lastIndexOf("-")).replaceAll(" ", "+").replaceAll("/", "+");
  var today = new Date();
  var time = pad2(today.getMinutes()) + pad2(today.getSeconds());
  var formattedDate = `${String(globalDate.getMonth() + 1).padStart(2, '0')}${String(globalDate.getDate()).padStart(2, '0')}${String(globalDate.getFullYear()).slice(-2)}`; //wp 030825 
  var newname = "VoiceTrack-" + formattedDate + "+" + tmp + time + "+" + localStorage.username + ".mp3"; //added username 031323 08/31/23 removed fileDate
  return newname;
}

function pad2(number) {
  return (number < 10 ? '0' : '') + number
}

function exportVT() {
  closeMenu();

  if (radlocal.checked == false) {
    var selectlist = document.getElementById("modal-content-connection");
    selectlist.style.height = "240px";
    var requestBtn = document.getElementById("requestvtlist");
    requestBtn.innerHTML = "Upload DONE VT Jobs";
    var selectlist = document.getElementById("selectvtlist");
    selectlist.style.display = "none";
    var jobbtn = document.getElementById("requiestvtjob");
    jobbtn.style.display = "none";
    var datepckr = document.getElementById("datepicker");
    datepckr.style.display = "none";
    var playlistbtn = document.getElementById("requestdayhour");
    playlistbtn.style.display = "none";
    var admindiv = document.getElementById("admindiv");
    admindiv.style.display = "none";
    conn_modal.style.display = "block";
    return;
  }

  exportVTDone();
}

async function exportVTDone() {
  if (extractedFile == undefined)
    return;

  var eptNm = zipFileName + " DONE.zip";
  // extractedFile.generateAsync({type:"blob"})
  // .then(function (content) {
  //   saveFile(content, eptNm);
  // });

  var zipFile = new JSZip();
  var syncCnt = 0, asynCnt = 0;
  extractedFile.forEach(function(relPath, file) {
    if (relPath.endsWith(".pls")) {
      file.async('blob').then(function(content) {
        zipFile.file(relPath, content);
        asynCnt++;
      });
      syncCnt++;
    }

    if (relPath.includes("VoiceTrack-")) {
      file.async('blob').then(function(content) {
        zipFile.file(relPath.replace("/Tracks/", "/VoiceTracks/"), content);
        asynCnt++;
      });
      syncCnt++;
    }
  });

  await until(_ => asynCnt == syncCnt);

  zipFile.generateAsync({type:"blob", compression: "DEFLATE", compressionOptions: {level: 9}})
  .then(function (content) {
    if (radlocal.checked == true)
      saveFile(content, eptNm);
    else
      SendFileToServer(content);

	///WP
	if (isSafari){
		dbDeleteFlag = true;	
		//globalAudioContext.suspend(); //wp
	//	subject.innerText = "Audio Engine Paused";//wp
	}
	
    //indexedDB.deleteDatabase("vtjob");WP
	
	
	//WP
	if(isSafari){	
		dbDeleteFlag = false;
		if(globalAudioContext.state != 'running'){//wp
			globalAudioContext.resume();
			//subject.innerText = "Audio Engine Resumed";//wp						
		}
	}
	
  });
}

function until(conditionFunction) {
  const poll = resolve => {
    if(conditionFunction()) resolve();
    else setTimeout(_ => poll(resolve), 10);
  }

  return new Promise(poll);
}

function saveFile(file, filename) {
  if (window.navigator.msSaveOrOpenBlob) // IE10+
      window.navigator.msSaveOrOpenBlob(file, filename);
  else { // Others
      var a = document.createElement("a"),
              url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function() {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);  
      }, 0);
  }
}

///07/2023WP
function getCanReorder(){	
	var oJSON = {};
    oJSON.MethodName = 'RequestCategoryList';
    oJSON.User = username.value;
    oJSON.PW = password.value;
    var req = new XMLHttpRequest();
    req.open('POST', GetServeUrl() + '/jsonAjaxRPC', false); 
    req.onload = function() {    
		var resJson = JSON.parse(req.response);		 
		if(Object.keys(resJson).length > 1)
		{
				canReorder = true;
		}
		else
		{
				canReorder = false;
		}
    }	
	req.send(JSON.stringify(oJSON));	
}
///07/2023WP