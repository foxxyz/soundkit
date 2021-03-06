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
    pause() {
        this.source.playbackRate.value = 0
    }
    pauseOrResume() {
        this.source.playbackRate.value === 0 ? this.resume() : this.pause()
    }
    play() {
        this.source.start(0)
        super.play()
    }
    resume() {
        this.source.playbackRate.value = 1
    }
    stop() {
        this.source.stop()
        super.stop()
    }
}