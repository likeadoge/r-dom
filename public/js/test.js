import { Computed, Effect, Reactive, ReactMap } from './reactive.js'
import { RElementNode, RNodeGroup, RNodeLoop, RTextNode } from './rnode.js'
import { log, log_node } from './log.js'
class Cell {

    pos = new Reactive({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    })

    hover = new Reactive(false)

    id = ''

    static all = new Reactive([])

    static row = new Reactive(5)

    static col = new Reactive(5)

    static prepare = new Reactive(null)

    static init() {
        const reflow = new Effect(() => {
            Cell.reflow()
        })
        Cell.row.attach(reflow)
        Cell.col.attach(reflow)
        Cell.reflow()

        Cell.row.attach(new Effect(()=>{
            log('row',`change to ${Cell.row.getVal()}`)
        }))

        Cell.col.attach(new Effect(()=>{
            log('col',`change to ${Cell.col.getVal()}`)
        }))

    }

    static reflow() {
        // 宽高变化进行单元格重排
        const rowLength = Cell.row.getVal()
        const colLength = Cell.col.getVal()

        Cell.all.updateVal(old => {

            // 删除超出范围的单元格
            const remains = old.filter(({ pos }) => {
                const { right, bottom } = pos.getVal()
                return !(right >= colLength || bottom >= rowLength)
            })

            // 添加覆盖不到的单元格
            const other = new Array(rowLength).fill(0)
                .flatMap((_, row) => new Array(colLength).fill(0)
                    .map((_, col) => ({ col, row })))
                .filter(({ row, col }) => remains.findIndex(cell => {
                    const pos = cell.pos.getVal()

                    const hor = pos.left <= col && pos.right >= col
                    const ver = pos.top <= row && pos.bottom >= row

                    return hor && ver
                }) < 0)
                .map(({ row, col }) => Cell.genSingle(row, col))

            log('reflow', `add ${other.length} cells`)
            return remains.concat(other)
        })

    }

    static genSingle(row, col) {
        return new Cell({
            top: row, bottom: row, left: col, right: col
        })
    }

    constructor({ left, right, top, bottom }) {

        this.id = 'c_' + Math.ceil(Math.random() * 100000)

        this.pos.setVal({ top, bottom, left, right })

        this.#update()

    }

    merge(cell) {

        const min = (a, b) => a < b ? a : b
        const max = (a, b) => a > b ? a : b

        const pos0 = cell.pos.getVal()
        const pos1 = this.pos.getVal()

        log('merge',`${
            [pos0.left,pos0.right,pos0.top,pos0.bottom].join('/')
        } to ${
            [pos1.left,pos1.right,pos1.top,pos1.bottom].join('/')
        } `)

        this.pos.setVal({
            left: min(pos0.left, pos1.left),
            right: max(pos0.right, pos1.right),
            top: min(pos0.top, pos1.top),
            bottom: max(pos0.bottom, pos1.bottom),
        })

        this.#update()

        Cell.reflow()
    }

    #update() {
        Cell.all.updateVal(list => [this].concat(list.filter((target) => {
            const { left, top, bottom, right } = target.pos.getVal()
            const pos = this.pos.getVal()

            const hor = (left >= pos.left && left <= pos.right)
                || (right >= pos.left && right <= pos.right)

            const ver = (top >= pos.top && top <= pos.bottom)
                || (bottom >= pos.top && bottom <= pos.bottom)

            return !(hor && ver)
        })))
    }

}

Cell.init()

const btnStyle = new ReactMap()
    .set('height', '40px')

const add_row_btn = new RElementNode({
    tag: "button",
    style: btnStyle,
    event: new ReactMap()
        .set('click', () => {
            log('action','add row')
            Cell.row.updateVal(v => v + 1)
        }),
    children: new RNodeGroup([
        new RTextNode({ text: 'add row' })
    ])
})

const add_col_btn = new RElementNode({
    tag: "button",
    style: btnStyle,
    event: new ReactMap()
        .set('click', () => {
            log('action','add col')
            Cell.col.updateVal(v => v + 1)
        }),
    children: new RNodeGroup([
        new RTextNode({ text: 'add col' })
    ])
})

const reset_btn = new RElementNode({
    tag: "button",
    style: btnStyle,
    event: new ReactMap()
        .set('click', () => {
            log('action','reset')
            Cell.all.setVal([])
            Cell.col.setVal(5)
            Cell.row.setVal(5)
            Cell.reflow()
        }),
    children: new RNodeGroup([
        new RTextNode({ text: 'reset' })
    ])
})

const cells = new RNodeGroup([
    new RNodeLoop(Cell.all, (c) => new RNodeGroup([
        new RElementNode({
            tag: 'div',
            event: new ReactMap()
                .set('mouseenter', () => {
                    c.hover.setVal(true)
                })
                .set('mouseleave', () => {
                    c.hover.setVal(false)
                })
                .set('click', () => {
                    const cell = Cell.prepare.getVal()
                    if (!cell)
                        return Cell.prepare.setVal(c)
                    else {
                        cell.merge(c)
                        Cell.prepare.setVal(null)
                    }

                }),
            style: new ReactMap()
                .set('gridArea', new Computed([c.pos], ({
                    left, right, bottom, top
                }) => `${top + 1}/${left + 1}/${bottom + 2}/${right + 2}`))
                .set('transition', 'all 0.2s ease-out')
                .set('textAlign', "center")
                .set('cursor', 'pointer')
                .set('boxShadow', new Computed([c.hover], h => h
                    ? '0 2px 4px rgba(0,0,0,0.2)'
                    : '0 0 0 rgba(0,0,0,0)'
                ))
                .set('borderRadius', new Computed([c.hover], h => h
                    ? '4px'
                    : '2px'
                ))
                .set('opacity', new Computed([c.hover], h => h
                    ? '0.9'
                    : '1'
                ))
                .set('transform', new Computed([c.hover], h => h
                    ? 'translate(0, -2px)'
                    : 'translate(0, 0px)'
                ))
                .set('background', '#66ccff')
                .set('outline', new Computed([Cell.prepare], cell => cell === c
                    ? `4px solid red`
                    : `4px solid transparent`
                ))
                .set('color', '#fff'),

            attr: new ReactMap(),
            children: new RNodeGroup([])
        })
    ]), v => v)
])


const grid = new RElementNode({
    tag: 'div',
    event: new ReactMap(),
    style: new ReactMap()
        .set('display', 'grid')
        .set("gridArea", 'grid')
        .set('gridTemplateColumns ', new Computed([Cell.col], v => `repeat(${v},auto)`))
        .set('gridTemplateRows ', new Computed([Cell.row], v => `repeat(${v}, auto)`))
        .set('height', '100%')//new Computed([Cell.row], v => `${v * 48 - 8}px`))
        .set('gridColumnGap', '8px')
        .set('gridRowGap', '8px'),
    attr: new ReactMap(),
    children: cells
})

const text = new RElementNode({
    tag: 'div',
    style: new ReactMap()
        .set("fontSize", '12px')
        .set("color", '#333')
        .set("gridArea", 'text'),
    children: new RNodeGroup([
        new RTextNode({ text: "点击单元格可合并" })
    ])
})

const container = new RElementNode({
    tag: 'div',
    event: new ReactMap(),
    style: new ReactMap()
        .set('display', 'grid')
        .set('gridTemplateAreas', `"log . . ."  "log text text text" "log grid grid grid"`)
        .set('gridTemplateColumns', `240px 1fr 1fr 1fr`)
        .set('gridTemplateRows', `40px 18px 1fr`)
        .set('gridColumnGap', '8px')
        .set('gridRowGap', '8px')
        .set('height', '100%')
    ,
    attr: new ReactMap(),
    children: new RNodeGroup([
        log_node,
        add_col_btn,
        add_row_btn,
        reset_btn,
        text,
        grid

    ])
})

document.body.appendChild(container.getNode())











