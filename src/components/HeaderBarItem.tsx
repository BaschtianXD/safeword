import { MouseEventHandler, ReactNode } from "react"

type HeaderBatItemProps = {
    text?: string
    icon?: ReactNode
    onClick?: MouseEventHandler<HTMLButtonElement>
}

function HeaderBatItem(props: HeaderBatItemProps) {
    return (
        <button className='hover:bg-slate-400 rounded px-1 h-6' onClick={props.onClick}>{props.text}{props.icon}</button>
    )
}

export default HeaderBatItem