import { invoke } from '@tauri-apps/api/tauri'

export type Vault = {
    name: string,
    data: [VaultEntry]
}

export type VaultEntry = {
    title: string,
    createdAt: string,
    lastChanged: string,
    lastUsed: string,
    data: { Password: Password },
    comment: string
}

export type Password = {
    website: string,
    username: string,
    password: string
}

export type Anything = {
    data: string
}

export type AddEntryArgument = {
    website: string,
    username: string,
    password: string,
    comment: string,
}

export async function openVault(path: string, password: string) {
    return invoke<Vault>("open_vault", {
        path: path,
        password: password
    })
}

export async function getVault() {
    return invoke<Vault>("get_vault")
}

export async function openFileSelect() {
    return invoke<string>("open_file_select")
}

export async function closeVault() {
    return invoke<void>("close_vault")
}

export async function addEntry(entry: AddEntryArgument) { // TODO add other type
    return invoke<Vault>("add_entry", {
        ...entry
    })
}

export async function removeEntry(index: number) {
    return invoke<Vault>("remove_entry", {
        index: index
    })
}

export async function updateEntry(index: number, entry: VaultEntry) {
    return invoke<Vault>("update_entry", {
        index: index,
        entry: entry
    })
}

export async function changePassword(newPassword: string) {
    return invoke<void>("change_password", {
        newPassword: newPassword
    })
}

export async function setClipboard(what: string, content: string, noHistory: boolean) {
    return invoke<void>("set_clipboard", {
        what: what,
        content: content,
        private: noHistory
    })
}
