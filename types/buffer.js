import { BaseSound } from './base'

export class BufferSound extends BaseSound {
    constructor(id, { buffer }, context, group, { loop, playbackRate }) {
        super(id)
        this.source = context.createBufferSource()
        this.source.channelCount = buffer.numberOfChannels
        this.source.buffer = buffer
        // Loop if necessary
        if (loop) this.source.loop = true
        if (playbackRate) this.source.playbackRate.value = playbackRate
        this.source.connect(group.connector)
        this.source.onended = this.ended.bind(this)
    }
    onStop() {
        super.onStop()
        this.source.disconnect()
    }
    pauseOrResume() {
        this.source.playbackRate.value = this.source.playbackRate.value == 0 ? 1 : 0
    }
    play() {
        this.source.start(0)
        super.play()
    }
    stop() {
        this.source.stop()
        super.stop()
    }
}