import React, { useState } from 'react';
import { openFileSelect, openVault, Vault } from '../backendtypes';
import Input from './Input';
import Modal from './Modal';

interface HomeProps {
    setVault: (vault: Vault) => void
}

function VaultSelection(props: HomeProps) {

    const [path, setPath] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")


    return (
        <div className='flex flex-col justify-between h-full'>
            <div className="flex flex-col w-full items-center gap-20">
                <p className='text-9xl mt-10'>SafeWord</p>
                <div className='flex flex-col items-center w-full gap-4'>
                    <div className='flex flex-row gap-2 items-stretch w-3/4'>
                        <p className='m-auto'>Path</p>
                        <Input value={path} readOnly></Input>
                        <button className="bg-slate-300 rounded p-1 whitespace-nowrap" onClick={() => {
                            openFileSelect()
                                .then((path) => setPath(path))
                        }}>Select Vault</button>
                    </div>
                    <div className="flex flex-row items-strecth w-3/4 gap-1">
                        <p className='m-auto'>Password</p>
                        <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
                    </div>
                    <div>
                        <button className='bg-slate-300 rounded p-1' disabled={!path && !password} onClick={event => {
                            openVault(path, password).then(vault => {
                                props.setVault(vault)
                                setError("")
                            }).catch(err => {
                                if (err && err.Base && err.Base === "WrongPassword") {
                                    console.log(err)
                                    setError("You have entered a wrong password")
                                } else if (err && err.Base && err.Base === "MalformedInput") {
                                    setError("This is not a SafeWord vault")
                                }
                            })
                        }}>Open Vault</button>
                    </div>
                    <div>
                        <button className='bg-slate-300 rounded p-1 cursor-not-allowed'>Create Vault</button>
                    </div>
                </div>

            </div>
            {error &&
                <Modal>
                    <div className='flex flex-row justify-around mb-5 bottom-0 w-full absolute pointer-events-auto select-none' onClick={() => setError("")}>
                        <p className='border-2 border-red-600 bg-red-400 p-2 rounded'>{error}</p>
                    </div>
                </Modal>}
        </div>

    );
}

export default VaultSelection;
