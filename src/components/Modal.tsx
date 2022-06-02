import { ReactNode } from "react"
import ReactDOM from "react-dom";

type ModalProps = {
    children?: [ReactNode] | ReactNode
    blocking?: boolean
    blur?: boolean
}

const modalRoot = document.getElementById("portal")!;

function Modal({ children, blur = false, blocking = false }: ModalProps) {

    var className = "w-screen h-screen transition-all"
    if (blur) {
        className += " backdrop-blur"
    }
    if (blocking) {
        className += " pointer-events-auto"
    }

    return ReactDOM.createPortal(
        <div className={className}>
            {children}
        </div>,
        modalRoot)
}

export default Modal