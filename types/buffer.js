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
        // Add gain node for this sound
        this.gain = context.createGain()
        this.gain.connect(group.connector)
        // Connect sound
        this.source.connect(this.gain)
        this.source.onended = this.ended.bind(this)
    }
    onStop() {
        super.onStop()
        this.source.disconnect()
        this.gain.disconnect()
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
    async stop(fadeDuration = 0.05) {
        this.gain.gain.setTargetAtTime(0, 0, fadeDuration / 4)
        await new Promise(res => setTimeout(res, fadeDuration * 1000))
        this.source.stop()
        super.stop()
    }
}