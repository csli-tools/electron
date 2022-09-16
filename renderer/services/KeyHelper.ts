import axios from 'axios'
import { keyActions, Key } from '../store/keys'

export interface MnemonicKey extends Key {
  mnemonic: string
}

export default class KeyHelper {

  static fetchKeys(appDispatch: any) {
    axios.get("http://localhost:8889/keys").then(response => {
      appDispatch(keyActions.upsertMany(response.data))
    })
  }
  
  static deleteKey(appDispatch: any, key: string) {
    axios.get("http://localhost:8889/key/delete", {params: {key}}).then(response => {
      appDispatch(keyActions.remove(key))
    })
  }
  
  static async createKey(appDispatch: any, key: string): Promise<MnemonicKey> {
    return new Promise(async (resolve, reject) => {
      axios.get("http://localhost:8889/key/create", {params: {key}}).then(response => {
        const {mnemonic, ...keyInfo} = response.data
        appDispatch(keyActions.upsert(keyInfo))
        resolve(response.data)
      }).catch(() => {
        reject()
      })
    })
  }
  
  static async getPrivateKey(key: string): Promise<Uint8Array> {
    return new Promise(async (resolve, reject) => {
      axios.get("http://localhost:8889/key", {params: {key}}).then(response => {
        const bytes = Buffer.from(response.data, 'base64').buffer
        resolve(new Uint8Array(bytes))
      }).catch(() => {
        reject()
      })
    })
  }
  
}
