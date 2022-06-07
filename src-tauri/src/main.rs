#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{
    fs::File,
    ops::DerefMut,
    sync::{Arc, Mutex},
};

use app::{save_and_close_vault, ClipboardError, CloseError, Error, SfState, Vault};
use rustpass::{Error as RpError, RpVaultEncrypted, VaultEntry};
use tauri::{api::dialog, State};
fn main() {
    let state = Arc::new(Mutex::new(None as Option<SfState>));
    let close_state = state.clone();
    let app = tauri::Builder::default()
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            open_file_select,
            open_vault,
            close_vault,
            set_last_used,
            get_vault,
            change_password,
            add_entry,
            remove_entry,
            update_entry,
            set_clipboard,
        ])
        .on_window_event(move |g_event| match g_event.event() {
            tauri::WindowEvent::CloseRequested { api: _, .. } => {
                let mut state = close_state.lock().unwrap();
                let state: &mut Option<SfState> = &mut state;
                let state = std::mem::take(state);
                match state {
                    Some(state) => match save_and_close_vault(state) {
                        Ok(_) => (),
                        Err(_) => println!("Could not save vault before closing"),
                    },
                    None => todo!(),
                }
            }
            _ => (),
        });

    app.run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn open_file_select() -> String {
    match dialog::blocking::FileDialogBuilder::new()
        .add_filter("SafeWordVault", &["swv"])
        .pick_file()
    {
        Some(path) => path.into_os_string().into_string().expect(""),
        None => "".into(),
    }
}

#[tauri::command]
fn open_vault(
    path: String,
    password: String,
    vault_lock: State<Arc<Mutex<Option<SfState>>>>,
) -> Result<Vault, Error> {
    let mut vault_op = vault_lock.lock().unwrap();
    if vault_op.is_some() {
        return Err(Error::VaultAlreadyOpened);
    }
    let vault_file = File::open(&path).expect("Could not open file");
    let enc_vault: RpVaultEncrypted = match ciborium::de::from_reader(&vault_file) {
        Ok(foo) => foo,
        Err(_) => return Err(Error::Base(RpError::MalformedInput)),
    };
    match enc_vault.decrypt(&password) {
        Ok(decrypted_vault) => {
            let name = decrypted_vault.name.clone();
            let vault = decrypted_vault.clone();
            let foo = vault.get_entries().to_owned();
            *vault_op = Some(SfState {
                path,
                password,
                vault,
            });
            Ok(Vault { name, data: foo })
        }
        Err(err) => Err(Error::Base(err)),
    }
}

#[tauri::command]
fn get_vault(vault_lock: State<Arc<Mutex<Option<SfState>>>>) -> Option<Vault> {
    let state_op = &*vault_lock.lock().unwrap();
    match &state_op {
        Some(state) => Some(Vault {
            name: state.vault.name.to_owned(),
            data: state.vault.get_entries().to_owned(),
        }),
        None => None,
    }
}

#[tauri::command]
fn close_vault(vault_lock: State<Arc<Mutex<Option<SfState>>>>) -> Result<(), CloseError> {
    let mut state_op = vault_lock.lock().unwrap();
    let mut foo = state_op.deref_mut();
    if foo.is_some() {
        let res = std::mem::replace(foo.deref_mut(), None).unwrap();
        return save_and_close_vault(res);
    }

    Ok(())
}

#[tauri::command]
fn set_last_used(
    vault_lock: State<Arc<Mutex<Option<SfState>>>>,
    index: usize,
) -> Result<Vault, Error> {
    let mut state_op = vault_lock.lock().unwrap();
    let state = match &mut *state_op {
        Some(state) => state,
        None => return Err(Error::NoVaultOpened),
    };
    state.vault.set_last_used(index);
    Ok(state.into())
}

#[tauri::command]
fn change_password(
    vault_lock: State<Arc<Mutex<Option<SfState>>>>,
    new_password: String,
) -> Result<(), Error> {
    let mut state_op = vault_lock.lock().unwrap();
    let state = match &mut *state_op {
        Some(state) => state,
        None => return Err(Error::NoVaultOpened),
    };
    match state.vault.change_password(&state.password, &new_password) {
        Ok(_) => Ok(()),
        Err(_) => Err(Error::Base(RpError::Unknown)),
    }
}

#[tauri::command]
fn add_entry(
    vault_lock: State<Arc<Mutex<Option<SfState>>>>,
    title: Option<String>,
    website: String,
    username: String,
    password: String,
    comment: String,
) -> Result<Vault, Error> {
    let mut state_op = vault_lock.lock().unwrap();
    let state = match &mut *state_op {
        Some(state) => state,
        None => return Err(Error::NoVaultOpened),
    };
    let entry = VaultEntry::new_password(website, title, username, password, comment);
    state.vault.add_entry(entry);
    Ok(state.into())
}

#[tauri::command]
fn remove_entry(
    vault_lock: State<Arc<Mutex<Option<SfState>>>>,
    index: usize,
) -> Result<Vault, Error> {
    let mut state_op = vault_lock.lock().unwrap();
    let state = match &mut *state_op {
        Some(state) => state,
        None => return Err(Error::NoVaultOpened),
    };
    state.vault.remove_entry(index);
    Ok(state.into())
}

#[tauri::command]
fn update_entry(
    vault_lock: State<Arc<Mutex<Option<SfState>>>>,
    index: usize,
    entry: VaultEntry,
) -> Result<Vault, Error> {
    let mut state_op = vault_lock.lock().unwrap();
    let state = match &mut *state_op {
        Some(state) => state,
        None => return Err(Error::NoVaultOpened),
    };
    state.vault.update_entry(index, entry);
    Ok(state.into())
}

#[cfg(target_os = "windows")]
#[tauri::command]
fn set_clipboard(what: &str, content: &str, private: bool) -> Result<(), ClipboardError> {
    use tauri::api::notification::Notification;
    use windows::{
        core::HSTRING,
        ApplicationModel::DataTransfer::{Clipboard, ClipboardContentOptions, DataPackage},
    };
    let options = match ClipboardContentOptions::new() {
        Ok(options) => options,
        Err(err) => return Err(ClipboardError::OsError(err.message().to_string())),
    };
    if let Err(err) = options.SetIsAllowedInHistory(!private) {
        return Err(ClipboardError::OsError(err.message().to_string()));
    };
    let datapackage = match DataPackage::new() {
        Ok(data) => data,
        Err(err) => return Err(ClipboardError::OsError(err.message().to_string())),
    };
    let hstring: HSTRING = content.into();
    if let Err(err) = datapackage.SetText(hstring) {
        return Err(ClipboardError::OsError(err.message().to_string()));
    };

    if let Err(err) = Clipboard::SetContentWithOptions(datapackage, options) {
        return Err(ClipboardError::OsError(err.message().to_string()));
    };
    if private {
        let noti = Notification::new("com.sbauer.safeword"); //TODO maybe do not hardcode this
        noti.title(format!("{} has been copied", what))
        .body(
            "You can now paste from your clipboard. Your clipboard will be cleared in 60 seconds.",
        )
        .show()
        .expect("Could not display notification");
    } else {
        let noti = Notification::new("com.sbauer.safeword"); //TODO maybe do not hardcode this
        noti.title(format!("{} has been copied", what))
            .body("You can now paste from your clipboard.")
            .show()
            .expect("Could not display notification");
    }

    Ok(())
}

#[cfg(not(target_os = "windows"))]
#[tauri::command]
fn set_clipboard(content: String, private: bool) -> Result<(), ClipboardError> {
    ClipboardError::NoNativeImplementation //TODO check wether options exist for linus and macos
}
