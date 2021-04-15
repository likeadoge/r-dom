


export class VNode {
    #node = null
    constructor(node) {
        this.#node = node
    }
    getNode() { return this.#node }
}

export class VTextNode extends VNode {
    #text = ''
    constructor({ text = '' }) {
        super(document.createTextNode(''))
        this.#text
        this.#updateText()
    }

    #updateText() {
        this.getNode().data = this.#text
    }
}

export class VElementNode extends VNode {

    // #tag = ""

    #style = new Map()
    #styleCache = new Map()
    #event = new Map()
    #eventCache = new Map()
    #attr = new Map()
    #attrCache = new Map()
    #children = []
    #childrenCache = []


    constructor({
        tag = "div",
        style = new Map(),
        event = new Map(),
        children = []
    }) {

        super(document.createElement(tag))

        // this.#tag = tag
        this.#style = style
        this.#event = event
        this.#text = text
        this.#children = children

        this.#updateAttr()
        this.#updateEvent()
        this.#updateStyle()
        this.#updateChildren()
    }

    #updateEvent() {
        Array.from(this.#eventCache.entries()).forEach((type, listener) => {
            this.getNode().removeEventListener(type, listener)
        })

        this.#eventCache.clear()

        Array.from(this.#event.entries()).forEach((type, listener) => {
            this.getNode().addEventListener(type, listener)
            this.#eventCache.set(type, listener)
        })
    }

    #updateStyle() {

        Array.from(this.#styleCache.entries()).forEach((type, listener) => {
            this.getNode().style[property] = ''
        })

        this.#styleCache.clear()

        Array.from(this.#style.entries()).forEach((property, value) => {
            this.getNode().style[property] = value
            this.#styleCache.set(property, value)
        })
    }

    #updateAttr() {
        Array.from(this.#styleCache.entries()).forEach((type, _) => {
            this.getNode().removeAttribute(type)
        })

        this.#attrCache.clear()

        Array.from(this.#attr.entries()).forEach((name, value) => {
            this.getNode().setAttribute(name, value)
            this.#attrCache.set(name, value)
        })
    }

    #updateChildren() {
        this.#childrenCache.forEach(node => {
            this.current.removeChild(node)
        })

        this.#childrenCache.length = 0

        this.#children.forEach(v => {
            this.getNode().appendChild(v.getNode())
            this.#childrenCache.push(v.getNode())
        })
    }
}


