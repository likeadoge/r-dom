import { ReactZone, zone } from './reactive.js'
import { RText, RNode, ROption, RNodeLoop } from './node.js'


const task1 = () => {

    const content = zone('out')
    const color = zone('red')
    const background = zone('#ccc')
    const text = new RText().setText(content)

    const style = new ROption()
        .add('color', color)
        .add('background', background)
        .add('textAlign', 'center')
        .add('margin', '12px')
        .add('padding', '12px')

    const event = new ROption()
        .add('mousemove', () => {
            color.set('green')
            content.set('in')
            background.set('#eee')
        })
        .add('mouseleave', () => {
            color.set('red')
            content.set('out')
            background.set('#ccc')
        })

    const node = new RNode({
        tag: 'div', text, style, event
    })

    document.body.appendChild(node.current)
}
const task2 = () => {

    const count = zone([0, 1, 2])
    const loop = new RNodeLoop({
        val: count,
        createKey: () => Math.random(),
        createNode: (v, i) => {
            const style = new ROption()
                .add('background', '#ccc')
                .add('textAlign', 'center')
                .add('cursor', 'pointer')
                .add('margin', '12px')
                .add('padding', '12px')
                .add('width', '45px')
                .add('float', 'left')

            const text = new RText().setText(v)
            const node = new RNode({
                tag: 'div', text, style,
            })
            return node
        }
    })

    const btn_style = new ROption()
        .add('background', '#ccc')
        .add('textAlign', 'center')
        .add('cursor', 'pointer')
        .add('margin', '12px')
        .add('padding', '12px')

    const btn_text = new RText().setText('+1')


    const btn_event = new ROption()
        .add('click', () => {
            const v = count.val()
            // const 
            count.set(v.concat([v.length]))
        })

    const btn = new RNode({
        tag: 'div', text: btn_text, style: btn_style, event: btn_event
    })


    const node = new RNode({
        tag: 'div', children: loop
    })

    document.body.appendChild(btn.current)
    document.body.appendChild(node.current)
}

task1()
task2()