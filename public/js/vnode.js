


export class VNode {
    #node = null
    constructor(node) {
        this.#node = node
    }
    setNode(node) { this.#node = node }
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

export class VNodeList {
    #list = []

    setList(list) { this.#list = list }
    getList() { return this.#list }

    getNodeList() { return this.#list.map(v => v.getNode()) }
}

export class VNodeGroup extends VNodeList {
    #group = []

    constructor(group) {
        super()
        this.#group = group
        super.setList(this.#group.flatMap(v =>
            v instanceof VNodeList
                ? v.getList()
                : v
        ))
    }
}

export class VNodeCase extends VNodeList {
    #val = false
    #list = null

    constructor(val, vNodeList) {
        super()
        this.#val = val
        this.#list = vNodeList
        if (this.#val)
            super.setList(this.#list.getList())
        else
            super.setList([])
    }
}

export class VNodeLoop extends VNodeList {
    #vals = []
    #createNodeList = () => { }
    #createKey = () => { }
    #cache = new Map()

    constructor(
        vals,
        createNodeList,
        createKey = () => Math.random(),
    ) {
        super()
        this.#vals = vals
        this.#createKey = createKey
        this.#createNodeList = createNodeList

        super.setList(Array.from(this.#vals).flatMap((val, index) => {
            const key = this.#createKey(val, index)
            const nodeList = this.#cache.has(key)
                ? this.#cache.get(key)
                : this.#createNodeList(val, index)
            newCache.set(key, nodeList)
            return nodeList.getList()
        }))
    }

}
