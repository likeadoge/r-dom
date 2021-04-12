




export const [node] = Symbol()

export class VElementNode {

    #tag = ""

    #style = new Map()
    #styleCache = new Map()
    #event = new Map()
    #eventCache = new Map()
    #attr = new Map()
    #attrCache = new Map()
    #children = []
    #childrenCache = []

    [node] = null

    constructor({
        tag = "div",
        style = new Map(),
        event = new Map(),
        children = []
    }) {
        this.#tag = tag
        this.#style = style
        this.#event = event
        this.#text = text
        this.#children = children

        this[node] = document.createElement(this.#tag)

        this.#updateAttr()
        this.#updateEvent()
        this.#updateStyle()
        this.#updateChildren()
    }

    #updateEvent() {
        Array.from(this.#eventCache.entries()).forEach((type, listener) => {
            this[node].removeEventListener(type, listener)
        })

        this.#eventCache.clear()

        Array.from(this.#event.entries()).forEach((type, listener) => {
            this[node].addEventListener(type, listener)
            this.#eventCache.set(type, listener)
        })
    }

    #updateStyle() {

        Array.from(this.#styleCache.entries()).forEach((type, listener) => {
            this[node].style[property] = ''
        })

        this.#styleCache.clear()

        Array.from(this.#style.entries()).forEach((property, value) => {
            this[node].style[property] = value
            this.#styleCache.set(property, value)
        })
    }

    #updateAttr() {
        Array.from(this.#styleCache.entries()).forEach((type, _) => {
            this[node].removeAttribute(type)
        })

        this.#attrCache.clear()

        Array.from(this.#attr.entries()).forEach((name, value) => {
            this[node].setAttribute(name, value)
            this.#attrCache.set(name, value)
        })
    }

    #updateChildren() {
        this.#childrenCache.forEach(node => {
            this.current.removeChild(node)
        })

        this.#childrenCache.length = 0

        this.#children.forEach(v => {
            this[node].appendChild(v[node])
            this.#childrenCache.push(v[node])
        })
    }
}

export class VTextNode {
    #text = ''
    [node] = null
    constructor({ text = '' }) {
        this.#text = text
        this[node] = document.createTextNode('')
        this.#updateText()
    }

    #updateText() {
        this[node].data = this.#text
    }
}
