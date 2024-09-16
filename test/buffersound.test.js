import assert from 'node:assert/strict'
import { beforeEach, describe, it, mock } from 'node:test'
import { SoundKit } from '../index.js'
import './mocks.js'

describe('BufferSound', () => {
    let sk
    beforeEach(() => {
        sk = new SoundKit()
        sk.init()
    })
    it('loads from file', async() => {
        await sk.load({ example: 'example.mp3' })
        assert(sk.sounds.example)
    })
    it('ignores duplicates', async() => {
        sk.sounds.example = true
        await sk.load({ example: 'example.mp3' })
        assert.equal(sk.sounds.example, true)
    })
    it('collates multiple successive loads', async() => {
        const loader = mock.method(sk.context, 'decodeAudioData')
        await Promise.all([
            sk.load({ example: 'example.mp3' }),
            sk.load({ example: 'example.mp3' })
        ])
        assert.equal(loader.mock.calls.length, 1)
    })
    it('plays successfully', async() => {
        await sk.load({ example: 'example.mp3' })
        const sound = sk.play('example')
        assert(sound)
        assert(sound.playing)
    })
    it('plays multiple simulataneous sounds', async() => {
        await sk.load({ example: 'example.mp3', test: 'test.mp3' })
        sk.play('example')
        sk.play('test')
        sk.play('example')
        assert.equal(sk.sounds.example.instances.length, 2)
        assert.equal(sk.sounds.test.instances.length, 1)
    })
    it('supports looping', async() => {
        await sk.load({ example: 'example.mp3' })
        const sound = sk.play('example', { loop: true })
        assert.equal(sound.source.loop, true)
    })
    it('supports variable playback rates', async() => {
        await sk.load({ example: 'example.mp3' })
        const sound = sk.play('example', { playbackRate: 1.5 })
        assert.equal(sound.source.playbackRate.value, 1.5)
    })
    it('supports grouping', async() => {
        sk.addGroup('master', { name: 'test' })
        await sk.load({ example: 'example.mp3' })
        const sound = sk.play('example', { group: 'test' })
        assert(sound.playing)
    })
    it('stops successfully', async() => {
        await sk.load({ example: 'example.mp3' })
        const sound = sk.play('example')
        assert.equal(sk.sounds.example.instances.length, 1)
        await sound.stop()
        assert(!sound.playing)
        assert.equal(sk.sounds.example.instances.length, 0)
    })
    it('stops with a longer fade if desired', async() => {
        await sk.load({ example: 'example.mp3' })
        // Set the mock sound to be 1 second long
        global.mockAudioLength = 1000
        const sound = sk.play('example')
        assert.equal(sk.sounds.example.instances.length, 1)
        assert.equal(sound.gain.gain.value, 1)
        // Stop in 100ms
        sound.stop(0.1)
        // After 50 ms the sound should still be playing
        await new Promise(res => setTimeout(res, 50))
        assert(sound.playing)
        // After 110 ms the sound should have stopped playing
        await new Promise(res => setTimeout(res, 60))
        assert(!sound.playing)
        assert.equal(sound.gain.gain.value, 0)
        assert.equal(sk.sounds.example.instances.length, 0)
    })
    it('stops multiple sounds', async() => {
        await sk.load({ example: 'example.mp3' })
        const [s1, s2] = [
            sk.play('example'),
            sk.play('example')
        ]
        await s1.stop()
        await s2.stop()
        assert.equal(sk.sounds.example.instances.length, 0)
    })
    it('pauses successfully', async() => {
        await sk.load({ example: 'example.mp3' })
        const sound = sk.play('example')
        sound.pause()
        assert.equal(sound.source.playbackRate.value, 0)
        sound.pause()
        assert.equal(sound.source.playbackRate.value, 0)
    })
    it('pause or resumes successfully', async() => {
        await sk.load({ example: 'example.mp3' })
        const sound = sk.play('example')
        sound.pauseOrResume()
        assert.equal(sound.source.playbackRate.value, 0)
        sound.pauseOrResume()
        assert.equal(sound.source.playbackRate.value, 1)
    })
    it('resumes successfully', async() => {
        await sk.load({ example: 'example.mp3' })
        const sound = sk.play('example')
        sound.pause()
        assert.equal(sound.source.playbackRate.value, 0)
        sound.resume()
        assert.equal(sound.source.playbackRate.value, 1)
        sound.resume()
        assert.equal(sound.source.playbackRate.value, 1)
    })
    it('emits end events when ended', async() => {
        await sk.load({ example: 'example.mp3' })
        const sound = sk.play('example')
        assert(sound.playing)
        const callback = mock.fn()
        sound.on('end', callback)
        sound.source.onended()
        assert.equal(callback.mock.calls.length, 1)
        assert(!sound.playing)
    })
    it('emits end events when stopped', async() => {
        await sk.load({ example: 'example.mp3' })
        const sound = sk.play('example')
        assert(sound.playing)
        const callback = mock.fn()
        sound.on('end', callback)
        await sound.stop()
        assert.equal(callback.mock.calls.length, 1)
        assert(!sound.playing)
    })
})
