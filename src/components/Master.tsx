import React, { useState } from 'react';
import { AddEntryArgument, Vault, VaultEntry } from '../backendtypes';
import Detail from './Detail';
import HeaderBarItem from './HeaderBarItem';
import { IoAdd, IoLockClosed } from "react-icons/io5"
import Input from './Input';
import Modal from './Modal';
import Button, { ButtonType } from './Button';

type MasterProps = {
  vault: Vault
  onCloseVault?: () => Promise<void>
  onDeleteEntry?: (index: number) => Promise<void>
  onAddEntry?: (entry: AddEntryArgument) => Promise<void>
}

function generateSecurePassword(length: number, delimiter: number): string {
  delimiter = delimiter < 4 ? 0 : delimiter
  const elements = "abcdefghijklmnopqrstuvwxyz!?.,$%/;:-_#+*§&(){[]}<>|ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  var raw = new Uint32Array(length)
  window.crypto.getRandomValues(raw)
  var res = ""
  raw.forEach((num, index) => {
    if (delimiter && index > 0 && index % delimiter === 0) {
      res += "-"
    }
    res += elements.charAt(Math.floor(num / (2 ** 32) * elements.length))
  })
  return res
}

const PwLengthDefault = 18

function Master(props: MasterProps) {

  const [selectedEntry, setSelectedEntry] = useState(undefined as VaultEntry | undefined)
  const [newEntry, setNewEntry] = useState(false)
  const [website, setWebsite] = useState("")
  const [customTitle, setCustomTitle] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [pendingDelete, setPendingDelete] = useState(undefined as number | undefined)
  const [newPwLength, setNewPwLength] = useState(PwLengthDefault)

  // lowest we allow is 4, therefore everything below 4 is considered no delimiter
  const [newPwDelimiter, setNewPwDelimiter] = useState(3)

  const closeNewEntryDialog = () => {
    setNewEntry(false)
    setWebsite("")
    setUsername("")
    setPassword("")
    setCustomTitle("")
    setNewPwLength(PwLengthDefault)
    setNewPwDelimiter(3)
  }

  const deletePendingEntry = () => {
    if (pendingDelete) {
      props.onDeleteEntry?.(pendingDelete)
      setSelectedEntry(undefined)
    }
    closeDeleteDialog()
  }

  const closeDeleteDialog = () => {
    setPendingDelete(undefined)
  }

  const getTitle = () => {
    if (customTitle) {
      return customTitle
    } else {
      var res = website
      if (username) {
        res = username + " @ " + website
      }
      return res
    }
  }


  return (
    <div className='flex flex-col w-full items-stretch h-full'>
      <div className='flex flex-row w-full h-10 items-center gap-1 justify-start bg-secondary px-2'>
        <HeaderBarItem onClick={() => props.onCloseVault?.()} icon={<IoLockClosed />} />
        <HeaderBarItem icon={<IoAdd />} onClick={() => setNewEntry(true)} />
        <HeaderBarItem text='Change password' />
        <HeaderBarItem text='Import' />
      </div>

      <div className='flex flex-row grow h-full overflow-auto'>
        <div className='w-96 overflow-auto divide-y divide-slate-800 bg-background-light'>
          {/* Master */}
          <table className='w-full table-auto border border-collapse cursor-default'>
            <tr>
              <th className='border'>Website</th>
              <th className='border'>Username</th>
            </tr>
            {props.vault.data.map(entry => {
              return (
                <tr className='cursor-pointer' onClick={() => setSelectedEntry(entry)}>
                  <td className='border p-1'>{entry.data.Password.website}</td>
                  <td className='border p-1'>{entry.data.Password.username}</td>
                </tr>
              )
            })}
          </table>
        </div>
        <div className='grow'>
          {/* Detail */}
          {selectedEntry ?
            <Detail entry={selectedEntry}
              onDeleteClick={() => {
                setPendingDelete(props.vault.data.indexOf(selectedEntry))
              }}
            /> : <p className='m-auto text-center w-full'>Selecte an entry to display more information</p>}
        </div>

      </div>

      <Modal open={newEntry} blocking blur>
        <div className='w-full h-full grid justify-center items-center'>
          <div className='w-fit h-fit bg-white rounded-md px-4 py-2 shadow-lg flex flex-col gap-4'>
            <div>
              <p className='w-full text-center font-bold'>Add new entry</p>
            </div>
            <div className='w-full'>
              <p>Website</p>
              <Input value={website} onChange={event => {
                setWebsite(event.target.value)
              }} />
            </div>
            <div>
              <p>Username</p>
              <Input value={username} onChange={event => setUsername(event.target.value)} />
            </div>
            <div>
              <p>Title</p>
              <Input value={getTitle()} onChange={event => setCustomTitle(event.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <p>Password generation</p>
              <div className='flex flex-col gap-1'>
                <div className='flex flex-row justify-between'>
                  <p>Length</p>
                  <p>{newPwLength < 12 ? "not secure! " : ""}{newPwLength}</p>
                </div>
                <input type="range" min="1" max="64" value={newPwLength} onChange={(event) => {
                  setNewPwLength(Number(event.target.value))
                  setNewPwDelimiter(Math.min(newPwDelimiter, Math.ceil(newPwLength / 2)))
                }}></input>
              </div>
              <div className='flex flex-col gap-1'>
                <div className='flex flex-row justify-between'>
                  <p>Delimiter</p>
                  {newPwDelimiter >= 4 ?
                    <p>every {newPwDelimiter} characters</p>
                    :
                    <p>none</p>
                  }

                </div>
                <input type="range" min="3" max={Math.ceil(newPwLength / 2)} value={newPwDelimiter} onChange={(event) => setNewPwDelimiter(Number(event.target.value))}></input>
              </div>

              <div className='flex flex-row justify-between items-end gap-10'>
                <p>Password</p>
                <button
                  onClick={() =>
                    setPassword(generateSecurePassword(newPwLength, newPwDelimiter))
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
                  website: website,
                  title: getTitle()
                }).then(() => closeNewEntryDialog())}
              >Add entry</button>
              <button className="m-auto bg-slate-300 rounded p-1"
                onClick={() => closeNewEntryDialog()}
              >Cancel</button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={pendingDelete !== undefined} blocking blur>
        <div className='w-full h-full grid justify-center items-center'>
          <div className='h-fit bg-white rounded-md px-4 py-2 shadow-lg flex flex-col gap-5'>
            <p>Do you want to delete this entry?</p>
            <div className='flex flex-row justify-center gap-6'>
              <Button text="Delete" type={ButtonType.negative} onClick={() => deletePendingEntry()} />
              <Button text="Cancel" onClick={() => closeDeleteDialog()} />
            </div>
          </div>
        </div>
      </Modal>




    </div>

  );
}

export default Master;
