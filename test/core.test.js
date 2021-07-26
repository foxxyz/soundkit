import { SoundKit } from '..'

describe('Core', () => {
    let sk
    it('creates audio context', () => {
        sk = new SoundKit()
        sk.init()
        expect(sk.context.state).toBe('running')
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
        expect(Object.keys(sk.groups).length).toBe(3)
    })
    it('removes audio context when closing', () => {
        sk = new SoundKit()
        sk.init()
        sk.stop()
        expect(sk.context).toBeFalsy()
    })
    it('handles manually closed contexts', () => {
        sk = new SoundKit()
        sk.init()
        sk.context.close()
        sk.stop()
        expect(sk.context).toBeFalsy()
    })
})

describe('Groups', () => {
    let sk
    beforeEach(() => {
        sk = new SoundKit()
        sk.init()
    })
    it('has master group by default', () => {
        expect(sk.groups.master).toBeTruthy()
    })
    it('adds groups', () => {
        sk.addGroup('master', { name: 'test' })
        expect(sk.groups.test).toBeTruthy()
        expect(sk.groups.test.muted).toBeFalsy()
        expect(sk.groups.test.gain.gain.value).toBe(1)
    })
    it('respects muted state of added groups', () => {
        sk.addGroup('master', { name: 'test', muted: true })
        expect(sk.groups.test.muted).toBeTruthy()
        expect(sk.groups.test.gain.gain.value).toBe(0)
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
        expect(sk.groups.test).toBeTruthy()
        expect(sk.groups.test2).toBeTruthy()
        expect(sk.groups.nested1).toBeTruthy()
        expect(sk.groups.nested2).toBeTruthy()
    })
    it('warns for duplicate groups', () => {
        const warning = jest.spyOn(console, 'warn')
        sk.addGroup('master', { name: 'test' })
        sk.addGroup('master', { name: 'test' })
        expect(warning).toHaveBeenCalledWith('Group test already exists!')
    })
})

describe('Errors', () => {
    let sk
    beforeEach(() => {
        sk = new SoundKit()
        sk.init()
    })
    it('should not try to play files if they can not be found', async() => {
        const warning = jest.spyOn(console, 'warn')
        const source = await sk.play('example')
        expect(source).toBeFalsy()
        expect(warning).toHaveBeenCalledWith('Sound example not found!')
    })
})
