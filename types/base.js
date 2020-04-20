import { nanoid } from 'nanoid'
import { EventEmitter } from 'events'

export class BaseSound extends EventEmitter {
    constructor(id) {
        super()
        // Generate random id if none given
        this.id = typeof id === 'string' ? id : nanoid(10)
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
