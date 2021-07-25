SoundKit: Easy In-Browser Audio
===============================

![tests](https://github.com/foxxyz/soundkit/workflows/tests/badge.svg)

Easy to use service for loading and playing sounds in web applications.

Features:

 * Uses `AudioContext` under the hood
 * ES7 / Async support
 * Mix and nest various sounds via group support
 * Easy fading of specific groups
 * Easy muting of specific groups
 * [Vue](https://vuejs.org/) plugin support
 * Fully tested

Requirements
------------

 * Node 10+

Installation
------------

```shell
npm install soundkit
```

Usage
-----

### Standalone

```javascript
import { SoundKit } from 'soundkit'
import beep from './sounds/beep.mp3'

let sound = new SoundKit()
async function run() {
    sound.init()
    await sound.load({ beep })
    sound.play('beep')
}
run()
```

### Vue Plugin

When creating your app:

```javascript
import { SoundKit } from 'soundkit'
app.use(SoundKit) // Use Vue.use(SoundKit) for 2.x
```

Inside a component:

```javascript
import yell from './sounds/yell.ogg'

export default {
    ...
    click() {
        this.$sound.play('yell')
    },
    async created() {
        this.$sound.init()
        await this.$sound.load({ yell })
    }
}
```

API Docs
--------

### Class `SoundKit`

#### `new SoundKit()`

Create a new SoundKit player.

#### `soundkit.addGroup(parent: string, { name: string, level?: float, muted?: Boolean })`

Create a sound group.

 * `parent`: Which group to add as a child to (optional) (set `undefined` to use this group as a root group)
 * `name`: Group name
 * `level`: Initial gain level (optional) (default: `1`)
 * `muted`: Whether this group should start muted (optional) (default: `false`)

#### `soundkit.addGroups(groups: Array, parent?: string)`

Add an array of groups.

 * `groups`: Array of groups to add (see [`addGroup()`](#soundkitaddgroupparent-string--name-string-level-float-muted-boolean-) for group object definition)
 * `parent`: Which group to add as children to (optional) (leave `undefined` to add as root)

#### `soundkit.fadeIn(group: string, duration?: float) : Promise`

Gradually decrease gain of group. Resolves when complete.

 * `group`: Name of group to fade (optional) (default: `"master"`)
 * `duration`: Duration of fade (optional) (default: `SoundKit.defaultFadeDuration`)

#### `soundkit.fadeOut(group: string, duration?: float) : Promise`

Gradually increase gain of group. See [`soundkit.fadeIn()`](#soundkitfadeingroup-string-duration-float--promise) for args.

#### `soundkit.init(groups?: Array)`

Initialize the player.

 * `groups`: Array of groups to add (see [`addGroup()`](#soundkitaddgroupparent-string--name-string-level-float-muted-boolean-) for group object definition) (optional) (defaults to one "master" group)

#### `soundkit.load(sounds: Object) : Promise`

Load one or more sounds and cache them for future use.

 * `sounds`: Object with name keys and URI values

#### `soundkit.play(key: string, options?: { group?: string, loop?: Boolean, playbackRate?: float })`

Play a previously loaded sound.

 * `key`: Name of sound as previously passed to [`load()`](#soundkitloadsounds-object--promise)
 * `group`: Name of group to play sound in. (optional) (default: `"master"`)
 * `loop`: Loop sound (optional) (default: `false`)
 * `playbackRate`: Sound playback rate (optional) (default: `1`)

#### `soundkit.setGain(group: string, level: float)`

Set group gain.

 * `group`: Name of the group to modify
 * `level`: Gain to set (`[0..1]``)

#### `soundkit.stop()`

Stop player and close AudioContext.

#### `soundkit.mute(group: string, enabled?: Boolean) : Promise`

Mute a particular group. Resolves when mute is complete.

 * `group`: Name of group to mute
 * `enabled`: Force on or off (optional) (toggles mute status if not specified)

### Class `Sound`

Sound objects are created with calls to [`soundkit.play()`](#soundkitplaykey-string-options--group-string-loop-boolean-playbackrate-float-) and should not be instantiated manually.

#### `sound.pause()`

Pause this sound.

#### `sound.pauseOrResume()`

Toggle between pause and resume states.

#### `sound.resume()`

Resume playing this sound after a pause.

#### `sound.stop()`

Stop playing this sound.

Contributing & Tests
--------------------

1. Install development dependencies: `npm install`
2. Run tests: `npm test`

License
-------

MIT
