

export const emit = Symbol()

export class Reactive {
    #val = undefined
    #watchers = []

    constructor(val = undefined) {
        this.#val = val
    }

    get() {
        return this.#val
    }
    set(newVal) {
        this.#val = newVal
        this.#watcher.forEach(v => v[emit]())
    }

    attach(watcher) {
        this.#watchers = this.#watchers.filter(v => v != watcher).concat([watcher])
    }

    detach(watcher) {
        this.#watchers = this.#watchers.filter(v => v != watcher)
    }
}

export class Effect {
    #fn = () => { }
    constructor(fn) { this.#fn = fn }
    [emit]() {
        this.#fn()
    }
}

export class ReactZone extends Reactive {

    #inputs = []
    #fn = (...args) => args

    #deps = []

    constructor(inputs, fn) {
        super()
        this.#inputs = inputs
        this.#fn = fn
        this.#deps = inputs.filter(v => v instanceof Reactive)
        this.#deps.forEach(v => v.attach(this))
        this.#update()
    }

    #update() {
        this.set(
            this.#fn(
                ...this.#inputs.map(
                    v => v instanceof Reactive
                        ? v.get()
                        : v
                )
            )
        )
    }

    [emit]() {
        this.#update()
    }
}