import { nanoid } from 'nanoid/non-secure'
import { EventEmitter } from 'events'

export class BaseSound extends EventEmitter {
    constructor() {
        super()
        // Generate random id if none given
        this.id = nanoid(10)
        this.playing = false
    }
    ended() {
        this.onStop()
        this.emit('end')
    }
    onStop() {
        this.playing = false
    }
    play() {
        this.playing = true
    }
    stop() {
        this.ended()
    }
}
