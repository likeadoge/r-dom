import { VNode } from "./rnode.js"

export const log_target = document.createElement('div')
export const log_grid = document.createElement('div')
export const log_node = new VNode()
export const log = (mod,msg)=>{
    const mod_tar = document.createElement('div')
    const msg_tar = document.createElement('div')

    mod_tar.style.textAlign = 'right'

    mod_tar.innerText = mod +':'
    msg_tar.innerText = msg

    log_grid.appendChild(mod_tar)
    log_grid.appendChild(msg_tar)

    log_target.scrollTop = log_target.scrollHeight;
}

log_node.setNode(log_target)
log_target.appendChild(log_grid)

log_target.style.border = '2px solid #999'
log_target.style.borderRadius = '3px'
log_target.style.gridArea = 'log'
log_target.style.overflow = 'auto'
log_target.style.padding = '12px 0'

log_grid.style.display = "grid"
log_grid.style.gridTemplateAreas = '". ."'

log_grid.style.gap = '8px'
log_grid.style.gridTemplateColumns = "72px auto"

