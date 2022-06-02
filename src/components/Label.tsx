type LabelProps = {
    text: string
}

function Label({ text }: LabelProps) {
    return (<p className="text-gray-700">{text}</p>)
}

export default Label