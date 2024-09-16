import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'
import { SoundKit } from '../index.js'
import './mocks.js'

const delay = ms => new Promise(res => setTimeout(res, ms))

describe('Muting', () => {
    let sk
    beforeEach(() => {
        sk = new SoundKit()
        sk.defaultFadeDuration = 0.001
        sk.init()
        sk.addGroup('master', { name: 'test' })
    })
    it('mutes successfully', async() => {
        sk.groups.master.muted = false
        await sk.mute()
        assert.equal(sk.groups.master.muted, true)
        assert.equal(sk.groups.master.gain.gain.value, 0)
        await sk.mute()
        assert.equal(sk.groups.master.muted, false)
        assert.equal(sk.groups.master.gain.gain.value, 1)
    })
})

describe('Fading', () => {
    let sk
    beforeEach(() => {
        sk = new SoundKit()
        sk.defaultFadeDuration = 0.001
        sk.init()
        sk.addGroup('master', { name: 'test' })
    })
    it('fades out master', async() => {
        await sk.fadeOut()
        assert.equal(sk.groups.master.gain.gain.value, 0)
    })
    it('fades in master', async() => {
        await sk.fadeOut()
        await sk.fadeIn()
        assert.equal(sk.groups.master.gain.gain.value, 1)
    })
    it('fades in if gain set manually', async() => {
        sk.setGain('master', 0)
        await sk.fadeIn()
        assert.equal(sk.groups.master.gain.gain.value, 1)
    })
    it('fades with duration 0', async() => {
        sk.defaultFadeDuration = 2
        const time = Date.now()
        await sk.fadeOut('master', 0)
        assert(Date.now() - time < 100)
    })
    it('fades out specific groups', async() => {
        await sk.fadeOut('test')
        assert.equal(sk.groups.test.gain.gain.value, 0)
        assert.equal(sk.groups.master.gain.gain.value, 1)
    })
    it('fades in specific groups', async() => {
        await sk.fadeOut('test')
        await sk.fadeIn('test')
        assert.equal(sk.groups.test.gain.gain.value, 1)
    })
    it('fades to specific levels', async() => {
        await sk.fadeTo(0.3, 'master')
        await sk.fadeTo(0.5, 'test')
        assert.equal(sk.groups.master.gain.gain.value, 0.3)
        assert.equal(sk.groups.test.gain.gain.value, 0.5)
    })
    it('does not override muted groups', async() => {
        await sk.mute('test', true)
        await sk.fadeTo(1, 'test')
        assert.equal(sk.groups.test.gain.gain.value, 0)
    })
    it('ignores if already at requested level', async() => {
        sk.groups.test.gain.gain.value = 0.98
        await sk.fadeTo(1, 'test')
        assert.equal(sk.groups.test.gain.gain.value, 0.98)
    })
    it('overrides muted state with force argument', async() => {
        await sk.mute('test', true)
        await sk.fadeTo(1, 'test', undefined, true)
        assert.equal(sk.groups.test.gain.gain.value, 1)
    })
    it('fades in when original level set to 0', async() => {
        const sk2 = new SoundKit()
        sk2.defaultFadeDuration = 0.001
        sk2.init()
        sk2.addGroup('master', { name: 'test', level: 0 })
        await sk2.fadeIn('test')
        assert.equal(sk2.groups.test.gain.gain.value, 1)
    })
})

describe('Gain Control', () => {
    let sk
    beforeEach(() => {
        sk = new SoundKit()
        sk.init()
    })
    it('sets master gain', async() => {
        sk.setGain('master', 0.5)
        await delay(1) // Wait for setValueAtTime to run
        assert.equal(sk.groups.master.level, 0.5)
        assert.equal(sk.groups.master.gain.gain.value, 0.5)
    })
    it('does not override muted groups', async() => {
        sk.groups.master.muted = true
        sk.groups.master.gain.gain.value = 0
        sk.setGain('master', 0.5)
        await delay(1) // Wait for setValueAtTime to run
        assert.equal(sk.groups.master.gain.gain.value, 0)
    })
})