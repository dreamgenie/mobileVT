function vumeter() {	
	// AUDIO WORKLET
	if (!scriptprocessor) {
		vumeterWorkletProcessor.port.onmessage = drawGoLiveVUmeter		
	} else {
		// SCRIPT PROCESSOR
		navigator.getUserMedia = navigator.getUserMedia ||  navigator.webkitGetUserMedia ||  navigator.mozGetUserMedia;
		// CONSTRAINTS INITIALIZED AS WINDOW VARIABLE IN INDEX.HTML SO THEY APPLY TO ALL AUDIO CAPTURE
		// var constraints = {
		//   audio: {		 						 
		//     sampleRate: {
		// 	  min: 44100, ideal: 44100 , max: 48000 
		// 	},
		//   }
		// };
		/*constraints.audio.sampleRate = {
		min: 44100, ideal: 44100, max: 48000 
		};
		if (navigator.getUserMedia) { navigator.getUserMedia(constraints, function(stream) {
		// audioContext = new AudioContext();*/
		audioContext = globalAudioContext;
		analyser = audioContext.createAnalyser();
		// microphone = audioContext.createMediaStreamSource(stream);
		microphone = mixedAudioSource;
		javascriptNode = audioContext.createScriptProcessor(256, 1, 1);

		analyser.smoothingTimeConstant = 0.9;
		analyser.fftSize = 256;
		analyser.minDecibels = -48;
		analyser.maxDecibels = 3;

		microphone.connect(analyser);
		analyser.connect(javascriptNode);
		javascriptNode.connect(audioContext.destination);
			
		vumetercanvas = document.getElementById("vumetercanvas");
		vumetercanvas.style.display = "block";
		ctx = vumetercanvas.getContext("2d");
		width = ctx.canvas.width;
		height = ctx.canvas.height;  
		
		javascriptNode.onaudioprocess = function() {
			var array = new Uint8Array(analyser.frequencyBinCount);
			analyser.getByteFrequencyData(array);
			
			//var values = 0;
			//var length = array.length;
			//for (var i = 0; i < length; i++) {
			//  values += (array[i]);
			//}
			//var average = values / length;	
			
			//WP		
			const sum = array.reduce((sum, value) => sum + value, 0);
			const average = (sum / array.length);	

			var gradient = ctx.createLinearGradient(0,0, width,0);	
			gradient.addColorStop(0, 'green');
			gradient.addColorStop(.9, '#FF8C00');
			gradient.addColorStop(1, 'red');		  
				
			//ctx.clearRect(0, 0, width, height);
			ctx.fillStyle = '#000000';
			ctx.fillRect(0, 0, width, height);
		
			if(average < 4){
				//ctx.fillStyle = '#BadA55';
				ctx.fillStyle = gradient
			}
			else{
				ctx.fillStyle = 'red';		  
			}
			ctx.fillRect(0, 0, average*100 , height)
		}
	}
    /*},
    function(err) {
      console.log("The following error occured: " + err.name)
    });
} else {
  console.log("getUserMedia not supported");
}*/

}
