registerProcessor('vumeter-worklet-processor', class extends AudioWorkletProcessor {
    constructor() {
        super()
        this.volume = 0
        this.updateIntervalInMS = 25
        this.nextUpdateFrame = this.updateIntervalInMS
        this.SMOOTHING_FACTOR = 0.8
        // this.port.onmessage = event => {
        //     if (event.data.updateIntervalInMS) {
        //         updateIntervalInMS = event.data.updateIntervalInMS
        //     }
        // }
    }
    process(inputs) {        
        var input = inputs[0]
        if (input.length > 0) {
            const samples = input[0]
            let sum = 0
            let rms = 0

            // calculate squared-sum
            for (let i = 0; i < samples.length; i++) {
                sum += samples[i] * samples[i]
            }

            // calculate RMS
            rms = Math.sqrt(sum / samples.length)
            this.volume = Math.max(rms, this.volume * this.SMOOTHING_FACTOR)

            // send volume to main thread
            this.nextUpdateFrame -= samples.length
            if (this.nextUpdateFrame < 0) {
                this.nextUpdateFrame += this.updateIntervalInMS / 1000 * sampleRate
                this.port.postMessage({volume: this.volume})
            }
        }

        return true;
    }
})