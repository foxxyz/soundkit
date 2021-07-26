import { SoundKit } from '..'

describe('Vue 2 Plugin', () => {
    let MockFramework
    beforeEach(() => {
        MockFramework = class {}
    })
    it('can be installed', () => {
        const player = new SoundKit()
        player.install(MockFramework)
        const app = new MockFramework()
        expect(app.$sound).toBe(player)
    })
    it('allows overriding global reference name', () => {
        const player = new SoundKit()
        player.install(MockFramework, { name: 'player' })
        const app = new MockFramework()
        expect(app.$player).toBe(player)
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
        expect(app.config.globalProperties.$sound).toBe(player)
    })
    it('allows overriding global reference name', () => {
        const player = new SoundKit()
        const app = new MockApp()
        app.use(player, { name: 'player' })
        expect(app.config.globalProperties.$player).toBe(player)
    })
})