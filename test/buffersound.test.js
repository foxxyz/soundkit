import { SoundKit } from '..'

describe('BufferSound', () => {
    let sk
    beforeEach(async() => {
        sk = new SoundKit()
        await sk.init()
    })
    it('loads from file', async () => {
        await sk.load({ example: 'example.mp3' })
        expect(sk.sounds.example).toBeTruthy()
    })
    it('ignores duplicates', async () => {
        sk.sounds.example = true
        const result = await sk.load({ example: 'example.mp3' })
        expect(result).toEqual([])
    })
    it('plays successfully', async () => {
        await sk.load({ example: 'example.mp3' })
        const sound = await sk.play('example')
        expect(sound).toBeTruthy()
        expect(sound.playing).toBeTruthy()
    })
    it('plays multiple simulataneous sounds', async () => {
        await sk.load({ example: 'example.mp3', test: 'test.mp3' })
        await Promise.all([
            sk.play('example'),
            sk.play('test'),
            sk.play('example')
        ])
        expect(sk.sounds.example.instances.length).toBe(2)
        expect(sk.sounds.test.instances.length).toBe(1)
    })
    it('supports looping', async () => {
        await sk.load({ example: 'example.mp3' })
        const sound = await sk.play('example', { loop: true })
        expect(sound.source.loop).toBe(true)
    })
    it('supports variable playback rates', async () => {
        await sk.load({ example: 'example.mp3' })
        const sound = await sk.play('example', { playbackRate: 1.5 })
        expect(sound.source.playbackRate.value).toBe(1.5)
    })
    it('supports grouping', async () => {
        sk.addGroup('master', { name: 'test' })
        await sk.load({ example: 'example.mp3' })
        const sound = await sk.play('example', { group: 'test' })
        expect(sound.playing).toBeTruthy()
    })
    it('stops successfully', async () => {
        await sk.load({ example: 'example.mp3' })
        const sound = await sk.play('example')
        expect(sk.sounds.example.instances.length).toBe(1)
        sound.stop()
        expect(sound.playing).toBeFalsy()
        expect(sk.sounds.example.instances.length).toBe(0)

    })
    it('stops multiple sounds', async () => {
        await sk.load({ example: 'example.mp3' })
        const [s1, s2] = await Promise.all([
            sk.play('example'),
            sk.play('example')
        ])
        s1.stop()
        s2.stop()
        expect(sk.sounds.example.instances.length).toBe(0)
    })
    it('pauses successfully', async () => {
        await sk.load({ example: 'example.mp3' })
        const sound = await sk.play('example')
        sound.pause()
        expect(sound.source.playbackRate.value).toBe(0)
        sound.pause()
        expect(sound.source.playbackRate.value).toBe(0)
    })
    it('pause or resumes successfully', async () => {
        await sk.load({ example: 'example.mp3' })
        const sound = await sk.play('example')
        sound.pauseOrResume()
        expect(sound.source.playbackRate.value).toBe(0)
        sound.pauseOrResume()
        expect(sound.source.playbackRate.value).toBe(1)
    })
    it('resumes successfully', async () => {
        await sk.load({ example: 'example.mp3' })
        const sound = await sk.play('example')
        sound.pause()
        expect(sound.source.playbackRate.value).toBe(0)
        sound.resume()
        expect(sound.source.playbackRate.value).toBe(1)
        sound.resume()
        expect(sound.source.playbackRate.value).toBe(1)
    })
    it('emits end events when ended', async () => {
        await sk.load({ example: 'example.mp3' })
        const sound = await sk.play('example')
        expect(sound.playing).toBeTruthy()
        const callback = jest.fn(() => {})
        sound.on('end', callback)
        sound.source.onended()
        expect(callback).toHaveBeenCalled()
        expect(sound.playing).toBeFalsy()
    })
})
