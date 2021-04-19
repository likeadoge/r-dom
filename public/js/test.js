import { Computed, Effect, Reactive, ReactMap } from './reactive.js'
import { RElementNode, RNodeGroup, RNodeLoop, RTextNode } from './rnode.js'

class Cell {

    top = 0
    bottom = 0
    left = 0
    right = 0

    hover = new Reactive(false)

    id = ''

    static all = new Reactive([])

    static row = new Reactive(5)

    static col = new Reactive(5)

    static init() {
        const reflow = new Effect(() => {
            Cell.reflow()
        })
        Cell.row.attach(reflow)
        Cell.col.attach(reflow)
        Cell.reflow()
    }

    static reflow() {
        // 宽高变化进行单元格重排
        const rowLength = Cell.row.getVal()
        const colLength = Cell.col.getVal()

        Cell.all.updateVal(old => {

            // 删除超出范围的单元格
            const remains = old.filter(({ right, bottom }) => {
                return right >= colLength || bottom >= rowLength
            })

            // 添加覆盖不到的单元格
            const other = new Array(rowLength).fill(0)
                .flatMap((_, row) => new Array(colLength).fill(0)
                    .map((_, col) => ({ col, row })))
                .filter(({ row, col }) => remains.findIndex(cell => {
                    const hor = cell.left <= col && cell.right >= col
                    const ver = cell.top <= row && cell.bottom >= row

                    return hor && ver
                }) < 0)
                .map(({ row, col }) => Cell.genSingle(row, col))

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

        this.top = top
        this.left = left
        this.bottom = bottom
        this.right = right

        Cell.all.updateVal(list => [this].concat(list.filter(({ left, right, bottom, top }) => {
            const hor = (left >= this.left && left <= this.right)
                || (right >= this.left && right <= this.right)

            const ver = (top >= this.top && top <= this.bottom)
                || (bottom >= this.top && bottom <= this.bottom)

            return !(hor && ver)
        })))

    }

}

Cell.init()

const cells = new RNodeGroup([
    new RNodeLoop(Cell.all, ({ left, right, top, bottom, hover }) => new RNodeGroup([
        new RElementNode({
            tag: 'div',
            event: new ReactMap()
                .set('mouseenter', () => {
                    console.log('mouseenter')
                    hover.setVal(true)
                })
                .set('mouseleave', () => {
                    console.log('mouseleave')
                    hover.setVal(false)
                }),
            style: new ReactMap()
                .set('grid-column-start', left + 1)
                .set('grid-column-end', right + 2)
                .set('grid-row-start', top + 1)
                .set('grid-row-end', bottom + 2)
                .set('transition', 'all 0.3s ease-out')
                .set('textAlign', "center")
                .set('cursor', 'pointer')
                .set('opacity', new Computed([hover], h => h ? '0.4' : '1'))
                .set('background', '#66ccff')
                .set('color', '#fff'),

            attr: new ReactMap(),
            children: new RNodeGroup([new RTextNode({ text: `cell` })])
        })
    ]), v => v)
])


const grid = new RElementNode({
    tag: 'div',
    event: new ReactMap(),
    style: new ReactMap()
        .set('display', 'grid')
        .set('gridTemplateColumns ', new Computed([Cell.col], v => `repeat(${v},auto)`))
        .set('gridTemplateRows ', new Computed([Cell.row], v => `repeat(${v},auto)`))
        .set('gridColumnGap', '8px')
        .set('gridRowGap', '8px'),
    attr: new ReactMap(),
    children: cells
})

console.log(cells)

document.body.appendChild(grid.getNode())











