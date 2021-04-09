import { ReactZone, Watcher } from './reactive.js'


export class _Reactable {
    emiter = new Watcher(() => this.update())

    #updateEvent = null

    onUpdate(fn) {
        this.#updateEvent = fn
    }
    // 更新操作 
    update() {
        if (this.#updateEvent) this.#updateEvent()
    }

}

export class RText extends _Reactable {
    #text = null

    setText(val) {
        if (val instanceof ReactZone) {
            val.addWatcher(this.emiter)
        }
        this.#text = val
        return this
    }
    getText() {
        return (
            this.#text instanceof ReactZone
                ? this.#text.val()
                : this.#text
        )
    }
}

export class ROption extends _Reactable {
    #map = new Map()
    each(cb) {
        Array.from(this.#map.entries()).forEach(([name, value]) => {
            cb([name, value instanceof ReactZone ? value.val() : value])
        })
    }
    add(name, val) {
        if (val instanceof ReactZone) {
            // 添加监听，修改的时候进行更新
            val.addWatcher(this.emiter)
        }
        this.#map.set(name, val)
        return this
    }
}

export class _RGroup extends _Reactable {
    getList() { return [] }
}

export class RNodeGroup extends _RGroup {
    #list = []
    getList() {
        return this.#list.map(
            v => v instanceof _RGroup ? v.getList()
                : v instanceof RNode ? v
                    : new Error('should be rNode!'))
    }

    setList(list) {
        this.#list = list
        this.#list.forEach(v => {
            if (v instanceof RNodeGroup) {
                v.onUpdate(function () {
                    this.emiter.emit()
                })
            }
        })
    }
}

export class RNode {
    #tag = 'div'

    #children = new RNodeGroup()
    #text = new RText()

    #style = new ROption()
    #event = new ROption()
    #attr = new ROption()

    current = null

    constructor({
        tag,
        style,
        event,
        attr,
        children,
        text
    }) {

        this.#tag = tag || this.#tag
        this.#text = text || this.#text
        this.#style = style || this.#style
        this.#event = event || this.#event
        this.#attr = attr || this.#attr
        this.#children = children || this.#children

        this.#style.onUpdate(() => this.#updateStyle())
        this.#event.onUpdate(() => this.#updateEvent())
        this.#attr.onUpdate(() => this.#updateAttr())
        this.#children.onUpdate(() => this.#updateChildren())
        this.#text.onUpdate(() => this.#updateText())

        this.#init()
    }

    #init() {
        this.current = document.createElement(this.#tag)
        this.#updateAttr()
        this.#updateEvent()
        this.#updateStyle()
        this.#updateChildren()
        this.#updateText()
    }

    #updateStyle() {
        this.#style.each(([name, value]) => {
            this.current.style[name] = value
        })
    }
    #updateEvent() {
        this.#event.each(([name, value]) => {
            this.current.addEventListener(name, value)
        })
    }
    #updateAttr() {
        this.#attr.each(([name, value]) => {
            this.current.setAttribute(name, value)
        })
    }
    #updateChildren() {
        if (this.#text.getText() !== null) return

        while (this.current.firstChild) {
            this.current.removeChild(this.current.firstChild);
        }

        this.#children.getList().forEach(v => {
            this.current.appendChild(v.current)
        })
    }
    #updateText() {
        if (this.#text.getText() === null) return
        this.current.innerText = this.#text.getText()
    }
}

export class RNodeCase extends _RGroup {
    #val = false
    #node = null

    constructor(val, node) {
        this.#node = node
        this.#val = val
        if (this.#val instanceof ReactZone) {
            this.#val.addWatcher(this.emiter)
        }
    }

    getList() {
        const val = this.#val instanceof ReactZone ? this.#val.val() : this.#val

        if (val && this.#node) return [this.#node]
        else return []
    }
}

export class RNodeLoop extends _RGroup {
    #val = []
    #cache = new Map()
    #createNode = (val, i) => { }
    #createKey = (val, i) => val

    constructor({
        createNode,
        createKey,
        val
    }) {
        super()
        this.#val = val
        this.#createKey = createKey || this.#createKey
        this.#createNode = createNode

        if (this.#val instanceof ReactZone) {
            this.#val.addWatcher(this.emiter)
        }
    }

    getList() {
        const arr = this.#val instanceof ReactZone
            ? this.#val.val()
            : this.#val
        const newCache = new Map()
        const oldCache = this.#cache
        const list = arr.map((v, i) => {
            const key = this.#createKey(v, i)
            const node = oldCache.has(key)
                ? oldCache.get(key)
                : this.#createNode(v, i)

            newCache.set(key, node)
            return node
        })
        this.#cache = newCache
        return list
    }
}





