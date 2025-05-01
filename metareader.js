const HEADER_SIZE = 10;

function getMetaData(file, ee) {
    var reader = new FileReader();

    reader.onload = function (event) {
        // console.log("in getmetadata", event.target.result);
        let header = new DataView(event.target.result, 0, HEADER_SIZE);
        let major = header.getUint8(3);
        let minor = header.getUint8(4);
        let version = `ID3v2.${major}.${minor}`;
        // console.log("version", version);

        let size = synchToInt(header.getUint32(6));
        let offset = HEADER_SIZE;
        let id3Size = HEADER_SIZE + size;
        // console.log("header size", header, size, offset, id3Size);
        while (offset < id3Size) {
            let frame = decodeFrame(event.target.result, offset);
            if (!frame) { break; }
            // console.log("meta data list", `${frame.id}: ${frame.value.length > 200 ? '...' : frame.value}`);
            offset += frame.size;
            if (frame.id === "TOWN") {
                var tagArray = frame.value.split("~");
                var sweeperId = tagArray[1];
                var sweepStart = tagArray[2];
                var introUntil = tagArray[3];
                var OutroStart = tagArray[4];
                var NextStart = tagArray[5];
                var rawSweepStart = tagArray[6];
                var rawIntroUntil = Number(tagArray[7]);
                var rawOutroStart = tagArray[8];
                var rawNextStart = Number(tagArray[9]);
                var VTStart_ = Number(tagArray[10]);
                var hookIn = tagArray[11];
                var hookOut = tagArray[12];
                var rawStart = tagArray[13];
                // console.log(sweeperId, sweepStart, introUntil, OutroStart, NextStart, rawSweepStart, rawIntroUntil, rawOutroStart, rawNextStart, VTStart_);
                // console.log("introUntil", introUntil);
                // console.log("NextStart", NextStart);
                // console.log("rawIntroUntil",rawIntroUntil);
                // console.log("rawNextStart", rawNextStart);
                // console.log("VTStart", VTStart_);

                // console.log("rawIntroUntil, rawNextStart", rawIntroUntil, rawNextStart);
                ee.emit("addmark", rawIntroUntil, rawNextStart);
                
				if (ee === ee3) {					
                    if (VTStart_ > 0)
                        vtStart = VTStart_;
                    else
                        vtStart = 10000;//curTrackLengthSeconds1 - 0.1;

                    if (rawNextStart > 0)
                        nextstart = rawNextStart;
                    else
                        nextstart = 10000;//curVoiceTrackLengthSecond - 0.1;

                    ee1.emit("markvtstart", vtStart);					
                }

                if (ee == ee2) {
                    var markintroEle = document.getElementById("markintro");
                    if (rawIntroUntil > 0) {						
                        markintroEle.style.display = "block";
                        intromark = rawIntroUntil;
                    }
                    //else WP
                    //    markintroEle.style.display = "none";
                }
            }
        }
    };

    // In case that the file couldn't be read
    reader.onerror = function (event) {
        console.error("An error ocurred reading the file: ", event);
    };

    // Read file as an ArrayBuffer, important !
    reader.readAsArrayBuffer(file);
}

let synchToInt = synch => {
    const mask = 0b01111111;
    let b1 = synch & mask;
    let b2 = (synch >> 8) & mask;
    let b3 = (synch >> 16) & mask;
    let b4 = (synch >> 24) & mask;

    return b1 | (b2 << 7) | (b3 << 14) | (b4 << 21);
};

let decode = (format, string) => new TextDecoder(format).decode(string);

const LANG_FRAMES = [
    'USLT',
    'SYLT',
    'COMM',
    'USER'
  ];

  const ID3_ENCODINGS = [
    'ascii',
    'utf-16',
    'utf-16be',
    'utf-8'
  ];

let decodeFrame = (buffer, offset) => {
    let header = new DataView(buffer, offset, HEADER_SIZE + 1);
    if (header.getUint8(0) === 0) { return; }

    let id = decode('ascii', new Uint8Array(buffer, offset, 4));
    let size = header.getUint32(4);
    let contentSize = size - 1;
    let encoding = header.getUint8(HEADER_SIZE);
  
    let contentOffset = offset + HEADER_SIZE + 1;

    let lang;
    if (LANG_FRAMES.includes(id)) {
      lang = decode('ascii', new Uint8Array(buffer, contentOffset, 3));
      contentOffset += 3;
      contentSize -= 3;
    }

    let value = decode(ID3_ENCODINGS[encoding], new Uint8Array(buffer, contentOffset, contentSize));
    // let value = new Uint8Array(buffer, contentOffset, contentSize);

    return {
        id, value, lang,
        size: size + HEADER_SIZE
      };
};

function ResetMp3tag(mp3ArrayBuffer) {
    var mp3file = writeMp3Tag(mp3ArrayBuffer, curVoiceTrackFile, nextstart, vtStart);
    extractedFile.remove(curVoiceTrackFullPath);
    extractedFile.file(curVoiceTrackFullPath, mp3file);

    ee1.emit("markvtstart", vtStart);
    ee3.emit("setvtstartandnext", vtStart, nextstart);
    console.log("ddddddddd", vtStart, nextstart);
}

function writeMp3Tag(buffer, vtfilename, nextstart, vtstart) {
    var metadatawriter = new ID3Writer(buffer);
    if (nextstart == 10000)
        nextstart = "";
    if (vtstart == 10000)
        vtstart = "";
    metadatawriter
        // .setFrame('COMM', {
        // 	description: 'Enter Comments Here',
        // 	text: '',
        // 	language: 'eng'
        // })
        // .setFrame('TALB', 'www.my12inch.com')
        // .setFrame('TBPM', 128)
        .setFrame('TCON', [255])
        .setFrame('TIT2', vtfilename.replace(".mp3", ""))
        .setFrame('TOWN', 'nkTag~~~~~~0~0~0~' + nextstart + '~' + vtstart)
        .setFrame('TPE1', ['VoiceTrack']);
        // .setFrame('TYER', 2020)
        // .setFrame('TCON', ['Soundtrack'])
        // .setFrame('TBPM', 128)
        // .setFrame('WPAY', 'https://google.com')
        // .setFrame('TKEY', 'Fbm')
        // .setFrame('APIC', {
        // 	  type: 3,
        // 	  data: coverArrayBuffer,
        // 	  description: 'Super picture'
        //  });
    metadatawriter.addTag();
    var tagblob = metadatawriter.getBlob();
    var mp3file = new File([tagblob], /*"VoiceTrack-" + */vtfilename/* + ".mp3"*/, {type:"audio/mp3", lastModified:new Date().getTime()});
    return mp3file;
}
