use std::fs::File;

use rustpass::{Error as RPError, Vault as RpVault, VaultEntry};
use serde::{Deserialize, Serialize};

pub struct SfState {
    pub path: String,
    pub password: String,
    pub vault: RpVault,
}

#[derive(Serialize)]
pub struct Vault {
    pub name: String,
    pub data: Vec<VaultEntry>,
}

pub struct VaultState(Option<RpVault>);

#[derive(Serialize, Deserialize)]
pub enum Error {
    Base(RPError),
    VaultAlreadyOpened,
    NoVaultOpened,
}

#[derive(Serialize)]
pub enum CloseError {
    FilesystemError,
    PasswordError,
}

#[derive(Serialize)]
pub enum ClipboardError {
    NoNativeImplementation,
    OsError(String),
}

impl Into<Vault> for &mut SfState {
    fn into(self) -> Vault {
        Vault {
            name: self.vault.name.to_owned(),
            data: self.vault.get_entries().to_owned(),
        }
    }
}

pub fn save_and_close_vault(state: SfState) -> Result<(), CloseError> {
    match state.vault.encrypt(&state.password) {
        Ok(enc_vault) => {
            let vault_file = File::create(&state.path).expect("Could not open file");
            if let Err(_err) = ciborium::ser::into_writer(&enc_vault, &vault_file) {
                // TODO improve error handling
                return Err(CloseError::FilesystemError);
            }
            vault_file.sync_all().expect("Could not sync file");
        }
        Err(_) => {
            // Should not fail as we save the password in our state
            return Err(CloseError::PasswordError);
        }
    }
    Ok(())
}
