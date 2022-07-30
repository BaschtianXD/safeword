type ButtonProps = {
    text: string,
    inactive?: boolean,
    type?: ButtonType,
    onClick?: () => void,
    disabled?: boolean
}

export enum ButtonType {
    primary,
    secondary,
    positive,
    negative
}

function Button(props: ButtonProps) {

    var cName = "rounded p-1 outline outline-1 hover:outline-2 focus:outline-2 select-none whitespace-nowrap"

    var buttonType = props.type ?? ButtonType.primary

    switch (buttonType) {
        case ButtonType.primary:
            cName += " text-primary outline-primary"
            break
        case ButtonType.secondary:
            cName += " text-secondary outline-secondary"
            break
        case ButtonType.positive:
            cName += " text-positive outline-positive"
            break
        case ButtonType.negative:
            cName += " text-negative outline-negative"
            break
    }

    return (<button className={cName} type="button" onClick={() => props.onClick?.()} disabled={props.disabled}>{props.text}</button>)
}

export default Button
