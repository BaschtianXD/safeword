import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import { addEntry, closeVault, getVault, removeEntry, Vault } from './backendtypes';
// With the Tauri API npm package:
import VaultSelection from './components/VaultSelection';
import Master from './components/Master';





function App() {

  const [vaultSnapshot, setVault] = useState(undefined as Vault | undefined)

  const load_vault = useCallback(() => {
    getVault()
      .then(vault => setVault(vault))
  }, [])

  useEffect(() => {
    load_vault()
  }, [load_vault])


  return (
    <>
      {!vaultSnapshot ?
        <VaultSelection setVault={newVault => setVault(newVault)} />
        :
        <Master vault={vaultSnapshot}
          onCloseVault={() =>
            closeVault().then(() => {
              setVault(undefined)
            }).catch(err => {
              console.log(err)
            })
          }
          onDeleteEntry={index =>
            removeEntry(index)
              .then(vault => {
                setVault(vault)
              })
          }
          onAddEntry={newEntry =>
            addEntry(newEntry)
              .then(vault => {
                setVault(vault)
              })
          }
        />
      }
    </>
  );
}

export default App;
