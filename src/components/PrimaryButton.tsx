type PrimaryButtonProps = {
    text: string,
    inactive?: boolean,
    type?: PrimaryButtonType,
    onClick?: () => void,
    disabled?: boolean
}

export enum PrimaryButtonType {
    primary,
    secondary,
    positive,
    negative
}

function PrimaryButton(props: PrimaryButtonProps) {

    var cName = "rounded p-2 select-none whitespace-nowrap"

    var buttonType = props.type ?? PrimaryButtonType.primary

    switch (buttonType) {
        case PrimaryButtonType.primary:
            cName += " text-primary bg-primary text-white"
            break
        case PrimaryButtonType.secondary:
            cName += " text-secondary bg-secondary text-black"
            break
        case PrimaryButtonType.positive:
            cName += " text-positive bg-positive text-black"
            break
        case PrimaryButtonType.negative:
            cName += " text-negative bg-negative text-black"
            break
    }

    if (props.disabled) {
        cName += ""
    }

    return (<button className={cName} onClick={() => props.onClick?.()} disabled={props.disabled}>{props.text}</button>)
}

export default PrimaryButton
