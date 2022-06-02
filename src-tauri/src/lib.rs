use rustpass::{Error as RPError, RpVault, VaultEntry};
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
