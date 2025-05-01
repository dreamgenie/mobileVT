var meterW = 288;
var meterH = 13;
var parentElement = document.getElementById("meter");
var canvasElement = document.createElement("canvas");
parentElement.appendChild(canvasElement);
canvasElement.style = 'overflow: hidden; position: relative; top: -5px; margin: 0; padding: 0; z-index: 1; width: ' + meterW + 'px; height: ' + meterH + 'px;';
var canvasContext = canvasElement.getContext('2d');

// AUDIO WORKLET
if (!scriptprocessor) {
	function drawGoLiveVUmeter(event) {
		let volume = 0		
		if (event.data.volume) {
			volume = event.data.volume
		}	

		vumetercanvas = document.getElementById("vumetercanvas")
		vumetercanvas.style.display = "block"
		ctx = vumetercanvas.getContext("2d")
		width = ctx.canvas.width
		height = ctx.canvas.height
		
		var gradient = ctx.createLinearGradient(0,0, width, 0)
		gradient.addColorStop(0, 'green')
		gradient.addColorStop(.9, '#FF8C00')
		gradient.addColorStop(1, 'red')	  
			
		//ctx.clearRect(0, 0, width, height)
		ctx.fillStyle = '#000000'
		ctx.fillRect(0, 0, width, height)

		var average = volume * 8

		if (average < 4) {
			//ctx.fillStyle = '#BadA55'
			ctx.fillStyle = gradient
		}
		else{
			ctx.fillStyle = 'red'
		}
		ctx.fillRect(0, 0, average * 100 , height)
	}
	globalAudioContext.audioWorklet.addModule('vumeter-worklet-processor.js').then(()=>{
		vumeterWorkletProcessor = new AudioWorkletNode(
			globalAudioContext,
			'vumeter-worklet-processor'
		)	
		// CONNECT
		var input = globalAudioContext.createGain()
		mixedAudioSource.connect(input)
		input.connect(vumeterWorkletProcessor)
	})
} else {
	function createAudioMeter(audioContext, clipLevel, averaging, clipLag) {	
		var processor = audioContext.createScriptProcessor(512);
		processor.onaudioprocess = volumeAudioProcess;	

		processor.clipping = false;
		processor.lastClip = 0;
		processor.volume = 0;
		processor.clipLevel = clipLevel || 1.56 //0.8; //WP changed becuase we multiplied value below to get better range response
		processor.averaging = averaging || 0.50;
		processor.clipLag = clipLag || 50;

		// this will have no effect, since we don't copy the input to the output,
		// but works around a current Chrome bug.
		processor.connect(audioContext.destination);

		processor.checkClipping = function() {
			if (!this.clipping)
				return false
			if ((this.lastClip + this.clipLag) < window.performance.now())
				this.clipping = false
			return this.clipping
		}

		processor.shutdown = function() {
			this.disconnect()
			this.onaudioprocess = null
		}

		return processor
	}

	function volumeAudioProcess( event ) {
		if (recordstate != "recording")
			return

		var buf = event.inputBuffer.getChannelData(0)
		var bufLength = buf.length
		var sum = 0
		var x

		// Do a root-mean-square on the samples: sum up the squares...
		for (var i = 0; i < bufLength; i++) {
			x = buf[i]
			if (Math.abs(x) >= this.clipLevel) {
				this.clipping = true
				this.lastClip = window.performance.now()
			}
			sum += x * x
		}

		// ... then take the square root of the sum.
		var rms =  Math.sqrt(sum / bufLength)

		// Now smooth this out with the averaging factor applied
		// to the previous sample - take the max here because we
		// want "fast attack, slow release."
		this.volume = Math.max(rms, this.volume * this.averaging)
	}

	var audioMeter = null;

	function onLevelChange( time ) {
		canvasContext.clearRect(0, 0, meterW * 1.6, 200/*meterH*/);

	if (audioMeter != null && recordstate == "recording") {
		if (audioMeter.checkClipping())
			canvasContext.fillStyle = "Maroon";
		else
			canvasContext.fillStyle = "SeaGreen";

		// draw a bar based on the current volume
		canvasContext.fillRect(0, 0, audioMeter.volume * meterW * 1.6 /*5*/, 200/*meterH*/);
	}

	// set up the next visual callback
	rafID = window.requestAnimationFrame( onLevelChange );
	}
		
	onLevelChange()
}
