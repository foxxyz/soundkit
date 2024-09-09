import { jest } from '@jest/globals'
import { SoundKit } from '..'

describe('BufferSound', () => {
    let sk
    beforeEach(() => {
        sk = new SoundKit()
        sk.init()
    })
    it('loads from file', async() => {
        await sk.load({ example: 'example.mp3' })
        expect(sk.sounds.example).toBeTruthy()
    })
    it('ignores duplicates', async() => {
        sk.sounds.example = true
        await sk.load({ example: 'example.mp3' })
        expect(sk.sounds.example).toEqual(true)
    })
    it('collates multiple successive loads', async() => {
        const loader = jest.spyOn(sk.context, 'decodeAudioData')
        await Promise.all([
            sk.load({ example: 'example.mp3' }),
            sk.load({ example: 'example.mp3' })
        ])
        expect(loader).toHaveBeenCalledTimes(1)
    })
    it('plays successfully', async() => {
        await sk.load({ example: 'example.mp3' })
        const sound = sk.play('example')
        expect(sound).toBeTruthy()
        expect(sound.playing).toBeTruthy()
    })
    it('plays multiple simulataneous sounds', async() => {
        await sk.load({ example: 'example.mp3', test: 'test.mp3' })
        sk.play('example')
        sk.play('test')
        sk.play('example')
        expect(sk.sounds.example.instances.length).toBe(2)
        expect(sk.sounds.test.instances.length).toBe(1)
    })
    it('supports looping', async() => {
        await sk.load({ example: 'example.mp3' })
        const sound = sk.play('example', { loop: true })
        expect(sound.source.loop).toBe(true)
    })
    it('supports variable playback rates', async() => {
        await sk.load({ example: 'example.mp3' })
        const sound = sk.play('example', { playbackRate: 1.5 })
        expect(sound.source.playbackRate.value).toBe(1.5)
    })
    it('supports grouping', async() => {
        sk.addGroup('master', { name: 'test' })
        await sk.load({ example: 'example.mp3' })
        const sound = sk.play('example', { group: 'test' })
        expect(sound.playing).toBeTruthy()
    })
    it('stops successfully', async() => {
        await sk.load({ example: 'example.mp3' })
        const sound = sk.play('example')
        expect(sk.sounds.example.instances.length).toBe(1)
        await sound.stop()
        expect(sound.playing).toBeFalsy()
        expect(sk.sounds.example.instances.length).toBe(0)
    })
    it('stops with a longer fade if desired', async() => {
        await sk.load({ example: 'example.mp3' })
        // Set the mock sound to be 1 second long
        window.mockAudioLength = 1000
        const sound = sk.play('example')
        expect(sk.sounds.example.instances.length).toBe(1)
        expect(sound.gain.gain.value).toEqual(1)
        // Stop in 100ms
        sound.stop(0.1)
        // After 50 ms the sound should still be playing
        await new Promise(res => setTimeout(res, 50))
        expect(sound.playing).toBeTruthy()
        // After 110 ms the sound should have stopped playing
        await new Promise(res => setTimeout(res, 60))
        expect(sound.playing).toBeFalsy()
        expect(sound.gain.gain.value).toEqual(0)
        expect(sk.sounds.example.instances.length).toBe(0)
    })
    it('stops multiple sounds', async() => {
        await sk.load({ example: 'example.mp3' })
        const [s1, s2] = [
            sk.play('example'),
            sk.play('example')
        ]
        await s1.stop()
        await s2.stop()
        expect(sk.sounds.example.instances.length).toBe(0)
    })
    it('pauses successfully', async() => {
        await sk.load({ example: 'example.mp3' })
        const sound = sk.play('example')
        sound.pause()
        expect(sound.source.playbackRate.value).toBe(0)
        sound.pause()
        expect(sound.source.playbackRate.value).toBe(0)
    })
    it('pause or resumes successfully', async() => {
        await sk.load({ example: 'example.mp3' })
        const sound = sk.play('example')
        sound.pauseOrResume()
        expect(sound.source.playbackRate.value).toBe(0)
        sound.pauseOrResume()
        expect(sound.source.playbackRate.value).toBe(1)
    })
    it('resumes successfully', async() => {
        await sk.load({ example: 'example.mp3' })
        const sound = sk.play('example')
        sound.pause()
        expect(sound.source.playbackRate.value).toBe(0)
        sound.resume()
        expect(sound.source.playbackRate.value).toBe(1)
        sound.resume()
        expect(sound.source.playbackRate.value).toBe(1)
    })
    it('emits end events when ended', async() => {
        await sk.load({ example: 'example.mp3' })
        const sound = sk.play('example')
        expect(sound.playing).toBeTruthy()
        const callback = jest.fn(() => {})
        sound.on('end', callback)
        sound.source.onended()
        expect(callback).toHaveBeenCalledTimes(1)
        expect(sound.playing).toBeFalsy()
    })
    it('emits end events when stopped', async() => {
        await sk.load({ example: 'example.mp3' })
        const sound = sk.play('example')
        expect(sound.playing).toBeTruthy()
        const callback = jest.fn(() => {})
        sound.on('end', callback)
        await sound.stop()
        expect(callback).toHaveBeenCalledTimes(1)
        expect(sound.playing).toBeFalsy()
    })
})
