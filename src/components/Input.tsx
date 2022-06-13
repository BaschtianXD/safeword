interface InputProps {
    value?: string
    onChange?: React.ChangeEventHandler<HTMLInputElement>
    type?: React.HTMLInputTypeAttribute
    readOnly?: boolean
    monoSpaceFont?: boolean
    tabIndex?: number
}

function Input(props: InputProps) {
    let className = "bg-secondary rounded p-1 w-full grow outline outline-1 outline-primary focus:outline-2"
    if (props.monoSpaceFont) {
        className += " font-mono"
    }
    if (props.readOnly) {
        className += "mouse-event-none"
    }
    return (
        <input
            className={className}
            onChange={props.onChange}
            type={props.type}
            value={props.value}
            readOnly={props.readOnly}
            tabIndex={props.tabIndex}
        ></input>
    )
}

export default Input