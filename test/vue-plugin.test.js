import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'
import { SoundKit } from '../index.js'

describe('Vue 2 Plugin', () => {
    let MockFramework
    beforeEach(() => {
        MockFramework = class {}
    })
    it('can be installed', () => {
        const player = new SoundKit()
        player.install(MockFramework)
        const app = new MockFramework()
        assert.equal(app.$sound, player)
    })
    it('allows overriding global reference name', () => {
        const player = new SoundKit()
        player.install(MockFramework, { name: 'player' })
        const app = new MockFramework()
        assert.equal(app.$player, player)
    })
})

describe('Vue 3 Plugin', () => {
    let MockApp
    beforeEach(() => {
        MockApp = class {
            constructor() {
                this.config = {
                    globalProperties: {}
                }
                this.cache = {}
            }
            provide(name, obj) {
                this.cache[name] = obj
            }
            use(plugin, options) {
                plugin.install(this, options)
            }
        }
    })
    it('can be installed', () => {
        const player = new SoundKit()
        const app = new MockApp()
        app.use(player)
        assert.equal(app.config.globalProperties.$sound, player)
    })
    it('allows overriding global reference name', () => {
        const player = new SoundKit()
        const app = new MockApp()
        app.use(player, { name: 'player' })
        assert.equal(app.config.globalProperties.$player, player)
    })
})