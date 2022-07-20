import { useState } from "react"
import { IoCopy, IoCreate, IoEye, IoEyeOff, IoTrash } from "react-icons/io5"
import { setClipboard, VaultEntry } from "../backendtypes"
import Label from "./Label"

type DetailProps = {
    entry: VaultEntry,
    onDeleteClick?: () => void
}

function Detail(props: DetailProps) {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <div className="flex flex-col gap-8 m-2">
            <div className="flex flex-row justify-between">
                <div>
                    <p>{props.entry.title}</p>
                </div>
                <div className="flex flex-row gap-2">
                    <button className="h-6"><IoTrash size={24} onClick={() => {
                        props.onDeleteClick?.()
                    }} /></button>
                    <button className="h-6"><IoCreate size={24} /></button>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <div className="flex flex-row gap-2">
                    <Label text="Website:" />
                    <p>{props.entry.data.Password.website}</p>
                </div>
                <div className="flex flex-row gap-2">
                    <p>Username:</p>
                    <p>{props.entry.data.Password.username}</p>
                    <button onClick={() => {
                        setClipboard("Username", props.entry.data.Password.username, false).catch((err) => {
                            if (err === 'NoNativeImplementation') {
                                navigator.clipboard.writeText(props.entry.data.Password.username)
                            }
                        })
                    }}><IoCopy /></button>
                </div>
                <div className="flex flex-row gap-2">
                    <p>Password:</p>
                    {showPassword ? <p className="font-mono">{props.entry.data.Password.password}</p> : <p>****************</p>}
                    <button onClick={() => {
                        setShowPassword((value) => !value)
                    }}>{showPassword ? <IoEye /> : <IoEyeOff />}</button>
                    <button onClick={() => {
                        setClipboard("Password", props.entry.data.Password.password, true).catch((err) => {
                            if (err === 'NoNativeImplementation') {
                                // We could not paste from the "backend" so do it via webview
                                navigator.clipboard.writeText(props.entry.data.Password.password)
                            }
                        })
                    }}><IoCopy /></button>
                </div>
            </div>
            <div>
                <p>Comment</p>
                <input readOnly></input>
            </div>
        </div>
    )
}

export default Detail