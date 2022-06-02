interface InputProps {
    value?: string
    onChange?: React.ChangeEventHandler<HTMLInputElement>
    type?: React.HTMLInputTypeAttribute
    readOnly?: boolean
    monoSpaceFont?: boolean
}

function Input(props: InputProps) {
    let className = "bg-slate-300 rounded p-1 w-full grow outline outline-2 outline-slate-400 focus:outline-slate-600"
    if (props.monoSpaceFont) {
        className += " font-mono"
    }
    return (
        <input
            className={className}
            onChange={props.onChange}
            type={props.type}
            value={props.value}
            readOnly={props.readOnly}
        ></input>
    )
}

export default Input