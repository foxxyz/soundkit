import assert from 'node:assert/strict'
import { beforeEach, describe, it, mock } from 'node:test'
import { SoundKit } from '../index.js'
import './mocks.js'

describe('Core', () => {
    let sk
    it('creates audio context', () => {
        sk = new SoundKit()
        sk.init()
        assert.equal(sk.context.state, 'running')
    })
    it('can initialize with multiple root groups', () => {
        sk = new SoundKit()
        const groups = [
            {
                name: 'root-one'
            },
            {
                name: 'root-two',
                children: [
                    { name: 'child-one' }
                ]
            }
        ]
        sk.init(groups)
        assert.equal(Object.keys(sk.groups).length, 3)
    })
    it('removes audio context when closing', () => {
        sk = new SoundKit()
        sk.init()
        sk.stop()
        assert(!sk.context)
    })
    it('handles manually closed contexts', () => {
        sk = new SoundKit()
        sk.init()
        sk.context.close()
        sk.stop()
        assert(!sk.context)
    })
})

describe('Groups', () => {
    let sk
    beforeEach(() => {
        sk = new SoundKit()
        sk.init()
    })
    it('has master group by default', () => {
        assert(sk.groups.master)
    })
    it('adds groups', () => {
        sk.addGroup('master', { name: 'test' })
        assert(sk.groups.test)
        assert(!sk.groups.test.muted)
        assert.equal(sk.groups.test.gain.gain.value, 1)
    })
    it('respects muted state of added groups', () => {
        sk.addGroup('master', { name: 'test', muted: true })
        assert(sk.groups.test.muted)
        assert.equal(sk.groups.test.gain.gain.value, 0)
    })
    it('adds hierarchy of groups', () => {
        const groups = [
            {
                name: 'test',
                children: [
                    { name: 'nested1' },
                    { name: 'nested2' }
                ]
            },
            {
                name: 'test2'
            }
        ]
        sk.addGroups(groups, 'master')
        assert(sk.groups.test)
        assert(sk.groups.test2)
        assert(sk.groups.nested1)
        assert(sk.groups.nested2)
    })
    it('warns for duplicate groups', () => {
        const warning = mock.method(console, 'warn')
        sk.addGroup('master', { name: 'test' })
        sk.addGroup('master', { name: 'test' })
        assert.equal(warning.mock.calls[0].arguments[0], 'Group test already exists!')
    })
})

describe('Errors', () => {
    let sk
    beforeEach(() => {
        sk = new SoundKit()
        sk.init()
    })
    it('should not try to play files if they can not be found', async() => {
        const warning = mock.method(console, 'warn')
        const source = await sk.play('example')
        assert(!source)
        assert.equal(warning.mock.calls[0].arguments[0], 'Sound example not found!')
    })
})
