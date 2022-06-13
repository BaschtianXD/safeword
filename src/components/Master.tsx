import React, { useState } from 'react';
import { AddEntryArgument, Vault, VaultEntry } from '../backendtypes';
import Detail from './Detail';
import HeaderBatItem from './HeaderBarItem';
import { IoAdd, IoLockClosed } from "react-icons/io5"
import Input from './Input';

type MasterProps = {
  vault: Vault
  onCloseVault?: () => Promise<void>
  onDeleteEntry?: (index: number) => Promise<void>
  onAddEntry?: (entry: AddEntryArgument) => Promise<void>
}

function generateSecurePassword(): string {
  const elements = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!_"
  var raw = new Uint8Array(18)
  window.crypto.getRandomValues(raw)
  var res = ""
  raw.forEach((num, index) => {
    if (index > 0 && index % 6 === 0) {
      res += "-"
    }
    res += elements.charAt(num >> 2)
  })
  return res
}

function Master(props: MasterProps) {

  const [selectedEntry, setSelectedEntry] = useState(undefined as VaultEntry | undefined)
  const [newEntry, setNewEntry] = useState(false)
  const [website, setWebsite] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const closeDialog = () => {
    setNewEntry(false)
    setWebsite("")
    setUsername("")
    setPassword("")
  }


  return (
    <div className='flex flex-col w-full items-stretch h-full'>
      <div className='flex flex-row w-full h-10 items-center gap-1 justify-start bg-slate-300 px-1'>
        <HeaderBatItem onClick={() => props.onCloseVault?.()} icon={<IoLockClosed />} />
        <HeaderBatItem icon={<IoAdd />} onClick={() => setNewEntry(true)} />
        <HeaderBatItem text='Change password' />
        <HeaderBatItem text='Import' />
      </div>

      <div className='flex flex-row grow h-full overflow-auto'>
        <div className='w-64 overflow-auto divide-y divide-slate-800'>
          {/* Master */}
          {props.vault.data.map((entry, index) => {
            return (
              <div className='flex flex-col items-start p-2 cursor-pointer' key={index} onClick={event => setSelectedEntry(entry)}>
                <p>{entry.title}</p>
                <p>{entry.data.Password.username}</p>
              </div>

            )
          })}
        </div>
        <div className='grow'>
          {/* Detail */}
          {selectedEntry ?
            <Detail entry={selectedEntry}
              onDeleteClick={() => {
                props.onDeleteEntry?.(props.vault.data.indexOf(selectedEntry))
                setSelectedEntry(undefined)
              }}
            /> : <p className='m-auto text-center w-full'>Selecte an entry to display more information</p>}
        </div>

      </div>

      <dialog open={newEntry} className="open:backdrop-blur-sm w-full h-full bg-transparent">
        <div className='w-full h-full flex flex-row justify-center'>
          <div className='w-1/2 h-fit bg-white rounded-md px-4 py-2 shadow-lg flex flex-col gap-4'>
            <div>
              <p className='w-full text-center font-bold'>Add new entry</p>
            </div>
            <div className='w-full'>
              <p>Website</p>
              <Input value={website} onChange={event => setWebsite(event.target.value)} />
            </div>
            <div>
              <p>Username</p>
              <Input value={username} onChange={event => setUsername(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <div className='flex flex-row justify-between items-end'>
                <p>Password</p>
                <button
                  onClick={() =>
                    setPassword(generateSecurePassword())
                  }
                  className="bg-slate-300 rounded p-1">Generate safe password</button>
              </div>
              <Input value={password} monoSpaceFont onChange={event => setPassword(event.target.value)} />
            </div>

            <div className='flex flex-row mt-4'>
              <button className="m-auto bg-slate-300 rounded p-1"
                onClick={() => props.onAddEntry?.({
                  comment: "",
                  password: password,
                  username: username,
                  website: website
                }).then(() => closeDialog())}
              >Add entry</button>
              <button className="m-auto bg-slate-300 rounded p-1"
                onClick={() => closeDialog()}
              >Cancel</button>
            </div>
          </div>
        </div>
      </dialog>





    </div>

  );
}

export default Master;
