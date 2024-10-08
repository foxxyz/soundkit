const delay = ms => new Promise(res => setTimeout(res, ms))

// Mock Web Audio API Connector
class Connector {
    constructor() {
        this.input = null
        this.destination = null
    }
    connect(destination, input) {
        this.input = input
        this.destination = destination
    }
}

// Mock Web Audio API Node
class Node {
    constructor({ inputs = 1, outputs = 1 }) {
        this.gain = new GainNode()
        this.outputs = []
        this.inputs = []
        for (let i = 0; i < inputs; i++) {
            this.inputs[i] = new Connector()
        }
        for (let i = 0; i < outputs; i++) {
            this.outputs[i] = new Connector()
        }
    }
    connect(destination, output, input) {
        this.outputs[output | 0].connect(destination, input | 0)
    }
    disconnect() {
        this.outputs = []
    }
}

// Mock Web Audio API GainNode
class GainNode {
    constructor() {
        this.value = 1
    }
    async setTargetAtTime(level, time) {
        await delay(time)
        this.value = level
    }
    async setValueAtTime(level, time) {
        await delay(time)
        this.value = level
    }
}

// Mock Fetch API Response
class Response {
    constructor() {
        this.buffer = new ArrayBuffer(8)
    }
    arrayBuffer() {
        return new Promise(res => {
            delay(1)
            res(this.buffer)
        })
    }
}

// Mock Web Audio API Destination
class Destination extends Node {
    constructor() {
        super({ })
        this.maxChannelCount = 16
    }
}

global.mockAudioLength = 50 // ms

// Mock the web audio API so tests work in node, the real API only works in browser
global.AudioContext = class {
    constructor() {
        this.state = 'running',
        this.destination = new Destination()
    }
    // eslint-disable-next-line
    createBufferSource() {
        const sourceNode = new Node({})
        sourceNode.playbackRate = {}
        sourceNode.start = () => {
            sourceNode.playing = true
            sourceNode.playback = setTimeout(() => {
                if (sourceNode.onended) sourceNode.onended()
            }, global.mockAudioLength)
        }
        sourceNode.stop = () => {
            clearTimeout(sourceNode.playback)
            if (sourceNode.onended) sourceNode.onended()
            sourceNode.playing = false
        }
        return sourceNode
    }
    // eslint-disable-next-line
    createGain() {
        return new Node({})
    }
    // eslint-disable-next-line
    decodeAudioData(buffer) {
        return new Promise(res => {
            delay(10)
            res(new Int32Array(buffer))
        })
    }
    close() {
        this.state = 'closed'
    }
}

// Mock browser native fetch
global.fetch = () => new Promise(res => {
    delay(10)
    res(new Response())
})
