import { ReactNode } from "react"

type ModalProps = {
    open: boolean
    children?: [ReactNode] | ReactNode
    blocking?: boolean
    blur?: boolean
}

function Modal(props: ModalProps) {

    var className = "w-full h-full bg-transparent"
    if (props.blur) {
        className += " open:backdrop-blur-sm"
    }
    if (props.blocking) {
        className += " pointer-events-auto"
    } else {
        className += " pointer-events-none"
    }

    return (
        <dialog open={props.open} className={className}>
            {props.children}
        </dialog>
    )
}

export default Modal