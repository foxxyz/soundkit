import { SoundKit } from '..'

const delay = (ms) => new Promise((res) => setTimeout(res, ms))

describe('Muting', () => {
    let sk
    beforeEach(async() => {
        sk = new SoundKit()
        sk.defaultFadeDuration = .001
        await sk.init()
        sk.addGroup('master', { name: 'test' })
    })
    it('mutes successfully', async () => {
        sk.groups.master.muted = false
        await sk.mute()
        expect(sk.groups.master.muted).toBe(true)
        expect(sk.groups.master.gain.gain.value).toBe(0)
        await sk.mute()
        expect(sk.groups.master.muted).toBe(false)
        expect(sk.groups.master.gain.gain.value).toBe(1)
    })
})

describe('Fading', () => {
    let sk
    beforeEach(async() => {
        sk = new SoundKit()
        sk.defaultFadeDuration = .001
        await sk.init()
        sk.addGroup('master', { name: 'test' })
    })
    it('fades out master', async () => {
        await sk.fadeOut()
        expect(sk.groups.master.gain.gain.value).toBe(0)
    })
    it('fades in master', async () => {
        await sk.fadeOut()
        await sk.fadeIn()
        expect(sk.groups.master.gain.gain.value).toBe(1)
    })
    it('fades out specific groups', async () => {
        await sk.fadeOut('test')
        expect(sk.groups.test.gain.gain.value).toBe(0)
        expect(sk.groups.master.gain.gain.value).toBe(1)
    })
    it('fades in specific groups', async () => {
        await sk.fadeOut('test')
        await sk.fadeIn('test')
        expect(sk.groups.test.gain.gain.value).toBe(1)
    })
    it('fades to specific levels', async () => {
        await sk.fadeTo(0.3, 'master')
        await sk.fadeTo(0.5, 'test')
        expect(sk.groups.master.gain.gain.value).toBe(0.3)
        expect(sk.groups.test.gain.gain.value).toBe(0.5)
    })
    it('does not override muted groups', async () => {
        await sk.mute('test', true)
        await sk.fadeTo(1, 'test')
        expect(sk.groups.test.gain.gain.value).toBe(0)
    })
    it('ignores if already at requested level', async () => {
        sk.groups.test.gain.gain.value = .98
        await sk.fadeTo(1, 'test')
        expect(sk.groups.test.gain.gain.value).toBe(.98)
    })
    it('overrides muted state with force argument', async () => {
        await sk.mute('test', true)
        await sk.fadeTo(1, 'test', undefined, true)
        expect(sk.groups.test.gain.gain.value).toBe(1)
    })
})

describe('Gain Control', () => {
    let sk
    beforeEach(async() => {
        sk = new SoundKit()
        await sk.init()
    })
    it('sets master gain', async () => {
        sk.setGain('master', 0.5)
        await delay(1) // Wait for setValueAtTime to run
        expect(sk.groups.master.level).toBe(0.5)
        expect(sk.groups.master.gain.gain.value).toBe(0.5)
    })
    it('does not override muted groups', async () => {
        sk.groups.master.muted = true
        sk.groups.master.gain.gain.value = 0
        sk.setGain('master', 0.5)
        await delay(1) // Wait for setValueAtTime to run
        expect(sk.groups.master.gain.gain.value).toBe(0)
    })
})