class WorkletProcessor extends AudioWorkletProcessor {
    constructor() {
        super()                    
    }
    process(inputs) {        
        var buffer = []
        var numChannels = 2
        var input = inputs[0]        

        for (var ch = 0; ch < numChannels; ++ch)
            buffer[ch] = input[ch]
        
        this.port.postMessage({ command: "record", buffer: buffer })

        return true;
    }
}
registerProcessor('record-worklet-processor', WorkletProcessor);