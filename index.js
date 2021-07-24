import { BufferSound } from './types'

const DEFAULT_GROUPS = [
    { name: 'master', level: 1 }
]

const decode = async (ctx, url) => {
    const res = await fetch(url)
    const buff = await res.arrayBuffer()
    return ctx.decodeAudioData(buff)
}

export class SoundKit {
    // Vue plugin support
    static install(Vue, { name='sound', ...options }={}) {
        // Create singleton
        const instance = new this(options)
        Vue.prototype[`$${name}`] = instance
    }
    constructor() {
        this.taskQueue = []
        this.defaultFadeDuration = .5
    }
    init(groupConfig) {
        this.context = new AudioContext()

        this.groups = {}
        this.addGroups(groupConfig || DEFAULT_GROUPS)

        this.sounds = {}
    }
    // Create a group of sounds
    addGroup(parent, { name, level=1, muted }) {
        // If channel already exists, ignore
        if (this.groups[name]) return console.warn(`Group ${name} already exists!`)

        const group = { level, muted }

        // Create gain
        const gainNode = this.context.createGain()
        gainNode.channelCount = 2
        gainNode.gain.value = muted ? 0 : level
        group.gain = gainNode

        // Connect group to gain
        group.connector = group.gain
        group.connector.connect(parent ? this.groups[parent].connector : this.context.destination)

        // Save
        this.groups[name] = group
    }
    // Add a group hierarchy at once
    addGroups(groups, parent) {
        for(const group of groups) {
            this.addGroup(parent, group)
            // Recursively add children
            if (group.children) this.addGroups(group.children, group.name)
        }
    }
    fadeIn(group) {
        group = group || 'master'
        return this.fadeTo(this.groups[group].level, ...arguments)
    }
    fadeOut() {
        return this.fadeTo(0, ...arguments)
    }
    fadeTo(value, group, duration, force=false) {
        group = group || 'master'
        duration = duration || this.defaultFadeDuration
        // Don't fade if this group is muted
        if (!force && this.groups[group].muted) return Promise.resolve()
        const gain = this.groups[group].gain.gain
        if (Math.abs(value - gain.value) < .03 && !force) return Promise.resolve()
        // 25% of total time reaches 98.2% gain
        // More info: https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setTargetAtTime for more info
        gain.setTargetAtTime(value, 0, duration / 4)
        return new Promise(res => setTimeout(res, duration * 1000))
    }
    async load(sounds) {
        for(const key in sounds) {
            // Ignore if this sound already exists
            if (this.sounds[key]) continue
            const sound = sounds[key]
            this.sounds[key] = {
                buffer: await decode(this.context, sound),
                instances: []
            }
        }
    }
    play(key, options) {
        // Ensure sound is available
        if (!this.sounds[key]) {
            return console.warn(`Sound ${key} not found!`)
        }
        const sound = this._play(BufferSound, { buffer: this.sounds[key].buffer }, options)

        // Track instances and remove when done
        const instances = this.sounds[key].instances
        instances.push(sound)
        sound.on('end', () => {
            instances.splice(instances.indexOf(sound), 1)
        })

        return sound
    }
    _play(soundClass, arg, { group, loop, playbackRate }={}) {
        // Connect to different group if required
        let destination = this.groups.master
        if (group) destination = this.groups[group]

        const sound = new soundClass(null, arg, this.context, destination, { loop, playbackRate })
        sound.play()
        return sound
    }
    setGain(group, value) {
        if (this.groups[group].muted) return
        this.groups[group].level = value
        this.groups[group].gain.gain.setValueAtTime(parseFloat(value), 0)
    }
    stop() {
        // Close/remove audio context
        if (this.context && this.context.state !== 'closed') this.context.close()
        this.context = undefined
    }
    mute(group, onOrOff) {
        group = group || 'master'
        const g = this.groups[group]
        const regularLevel = g.level
        if (!g.muted) g.muted = false
        g.muted = onOrOff !== undefined ? onOrOff : !g.muted
        return this.fadeTo(g.muted ? 0 : regularLevel, group, undefined, true)
    }
}