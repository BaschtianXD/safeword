import React, { useState } from 'react';
import { createVault, openFileSave, openFileSelect, openVault, Vault } from '../backendtypes';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';
import PrimaryButton from './PrimaryButton';

interface HomeProps {
    setVault: (vault: Vault) => void
}

function VaultSelection(props: HomeProps) {

    const [path, setPath] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [newVault, setNewVault] = useState(false)
    const [newVaultName, setNewVaultName] = useState("")
    const [newVaultPath, setNewVaultPath] = useState("")
    const [newVaultPassword, setNewVaultPassword] = useState("")
    const [osDialogOpen, setOsDialogOpen] = useState(false)

    const closeDialog = () => {
        setNewVault(false)
        setNewVaultName("")
        setNewVaultPassword("")
        setNewVaultPath("")
    }


    return (
        <div className='flex flex-col justify-between h-full'>
            <div className="flex flex-col w-full items-center gap-20">
                <p className='text-9xl mt-10 text-primary'>SafeWord</p>
                <div className='flex flex-col items-center w-full gap-4'>
                    <div className='flex flex-row gap-2 items-stretch w-3/4'>
                        <p className='m-auto'>Path</p>
                        <Input value={path} readOnly tabIndex={-1}></Input>
                        <Button text="Select Vault" onClick={() => {
                            setOsDialogOpen(true)
                            openFileSelect()
                                .then((path) => setPath(path))
                                .finally(() => setOsDialogOpen(false))
                        }} />
                    </div>
                    <div className="flex flex-row items-strecth w-3/4 gap-1">
                        <p className='m-auto'>Password</p>
                        <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
                    </div>
                    <div>
                        <PrimaryButton text="Open vault" disabled={!path && !password} onClick={() => {
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
                        }} />
                    </div>
                    <p>or</p>
                    <div>
                        <PrimaryButton onClick={() => setNewVault(true)} text="Create new vault" />
                    </div>
                </div>

            </div>
            <Modal open={!!error}>
                <div className='flex flex-row justify-around mb-5 bottom-0 w-full absolute pointer-events-auto select-none' onClick={() => setError("")}>
                    <p className='border-2 border-red-600 bg-red-400 p-2 rounded'>{error}</p>
                </div>
            </Modal>

            <Modal open={newVault} blocking blur>
                <div className='w-full h-full grid items-center justify-center'>
                    <div className='w-[550px] h-fit bg-white rounded-md px-4 py-2 shadow-lg flex flex-col gap-4'>
                        <div>
                            <p className='w-full text-center font-bold'>Create a new vault</p>
                        </div>
                        <div className='w-full'>
                            <p>Name</p>
                            <Input value={newVaultName} onChange={event => setNewVaultName(event.target.value)} />
                        </div>
                        <div className='w-full'>
                            <p>Path</p>
                            <div className='flex flex-row w-full gap-2'>
                                <Input value={newVaultPath} readOnly />
                                <Button text="Select Path" onClick={() => openFileSave(newVaultName ?? undefined).then(path => setNewVaultPath(path))} />
                            </div>
                        </div>
                        <div className='w-full'>
                            <p>Password</p>
                            <Input value={newVaultPassword} monoSpaceFont onChange={event => setNewVaultPassword(event.target.value)} />
                        </div>


                        <div className='flex flex-row mt-4'>
                            <button className="m-auto bg-slate-300 rounded p-1"
                                onClick={() => createVault(newVaultName, newVaultPath, newVaultPassword).then(vault => props.setVault(vault)).catch(err => setError("Could not create vault."))}
                            >Add entry</button>
                            <button className="m-auto bg-slate-300 rounded p-1"
                                onClick={() => closeDialog()}
                            >Cancel</button>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal open={osDialogOpen} blur blocking></Modal>
        </div>



    );
}

export default VaultSelection;
