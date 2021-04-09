
export class Watcher {
    constructor(cb) { this.#cb = cb }
    #cb = () => { }
    emit() { this.#cb() }
}


export class ReactZone extends Watcher {

    constructor(list, transformer) {
        super(() => this.#update())
        this.#transfromer = transformer
        this.#inputs = list
        this.#inputs.filter(v => v instanceof ReactZone).forEach(v => v.addWatcher(this))
        this.#update()
    }

    // 当前缓存的值
    #output = null

    // 监视的对象
    #inputs = []

    // 根据输出得出结果的转换函数
    #transfromer = () => { }

    // 更新操作
    #update() {
        // 计算新值
        this.#output = this.#transfromer(...this.#inputs.map(v => v instanceof ReactZone ? v.val() : v))
        // 通知监听对象进行更新
        this.#watchers.forEach(v => v.emit())
    }

    // 监听的对象
    #watchers = []
    addWatcher(watcher) {
        this.#watchers = this.#watchers.filter(v => v === watcher).concat([watcher])
    }

    val() { return this.#output }
    set(...list) { this.#inputs = list; this.#update()}

    // 衍生一个新 rz 对象
    map(cb) {
        return new ReactZone([this],cb)
    }

}


export const zone = (...args) => new ReactZone(args, v => v)

export const zlist = (...args) => new ReactZone(args, (...v) => v)
