import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { TrashIcon } from '@heroicons/react/24/outline'

import Wasm from '../services/Wasm'
import { Coin, StdFee } from "@cosmjs/stargate";

import { useAppSelector, useAppDispatch } from '../store/'
import { Key, keySelectors } from '../store/keys'
import { default as ContractInstanceElement } from './Contract'
import styles from '../styles/Subpanel.module.css'
import classNames from '../utils/classNames'
import KeyHelper, { MnemonicKey } from '../services/KeyHelper'
import Balance from './Balance'
import Modal from './Modal'

const Keys: React.FC = () => {
  const [modalShown, setModalShown] = useState(false)
  const [mnemonicModalShown, setMnemonicModalShown] = useState(false)
  const [keyInput, setKeyInput] = useState("")
  const [createdKey, setCreatedKey] = useState<MnemonicKey | undefined>(undefined)
  
  const keys = useAppSelector(state => keySelectors.selectAll(state))
  const appDispatch = useAppDispatch()
  
  const authorize = useCallback(() => {
    KeyHelper.fetchKeys(appDispatch)
  }, [])
  
  const deleteKey = useCallback((key: string) => {
    KeyHelper.deleteKey(appDispatch, key)
  }, [])
  
  useEffect(() => {
    if (keys.length > 0) {
      // the user has previously authorized a check for keys, refresh each subsequent time the view is shown
      KeyHelper.fetchKeys(appDispatch)
    }
  }, [keys])
  
  const showCreateKeyModal = useCallback(() => {
    setModalShown(true)
  }, [])
  
  const createKey = useCallback(async () => {
    const key = await KeyHelper.createKey(appDispatch, keyInput)
    setMnemonicModalShown(true)
    setCreatedKey(key)
    setModalShown(false)
    setKeyInput("")
  }, [keyInput])
  
  const clearKey = useCallback(() => {
    window.setTimeout(() => {
      setCreatedKey(undefined)  
    }, 250) //delay this til after animation has completed
  }, [])
  
  useEffect(() => {
    Wasm.sharedInstance().signingClient("sam").then(async client => {
      const cash: Coin[] = [{amount: "100", denom: "stake"}]
      const fee: StdFee = {
        amount: cash,
        gas: "1000000"
      }
      await client.sendTokens("wasm1kp8tmrctptd5p70xp8a55dt0xfxx3dwv5ja9ru", "wasm1fczjk0j96gtexdrkjccnawtsyglz20dugmg76e", cash, fee)
    }).catch(error => {
      
      console.log(error)
    })
    
  }, [])

  return (
    <div className="p-8 h-full px-4 sm:px-6 md:px-8">
      <div className="h-full w-full space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl flex font-semibold text-gray-900">Key Management</h2>
          <button className="bg-seafoam-500 text-white rounded p-2 text-xs cursor-pointer" onClick={() => showCreateKeyModal()}>Create Key</button>
        </div>
        {keys.length === 0 &&
          <div>
            <p>In order to maximize compatibility with <span className="italic rounded bg-seafoam-100 px-1">wasmd</span>, CSLI ships with a small helper utility called <span className="italic rounded bg-seafoam-100 px-1">key-helper</span>. If you authorize it, it will interface with your operating system’s secure store and periodically access private keys to sign transactions that you initiate in CSLI. If you have exsisting keys in wasmd, you‘ll be immediately prompted for access to each of them upon authorization.</p>
            <button className="rounded border p-2" onClick={authorize}>Authorize</button>
          </div>
        }
        <ul className="grid grid-cols-2 gap-4 mt-6">
          {keys.map(key => {
            return (
              <li key={key.name} className="border rounded p-2 flex justify-between items-center">
                <div>
                  <div className="inline-flex space-x-2">
                    <span className="font-bold">{key.name}</span>
                    <span className="rounded-full bg-seafoam-300 text-xs inline-flex justify-center items-center px-2">{key.algorithm}</span>
                  </div>
                  <Balance address={key.address} />
                  <div>{key.address}</div>
                </div>
                <div className="text-failure">
                  <TrashIcon onClick={() => deleteKey(key.name)} className="w-icon cursor-pointer" />
                </div>
              </li>
            )
          })}
        </ul>
      </div>
      <Modal isShown={modalShown} setIsShown={setModalShown} title="Create Key" confirm="Create" cancel="Cancel" canCommit={keyInput.length > 0} onCommit={createKey}>
        <div className="mt-5 sm:mt-6 text-left">
          <label htmlFor="key-name" className="block font-bold">Key Name</label>
          <input id="key-name" type="text" className="rounded border w-full block p-1" onChange={(e) => setKeyInput(e.target.value)} value={keyInput} />
        </div>
      </Modal>
      
      <Modal isShown={mnemonicModalShown} setIsShown={setMnemonicModalShown} title="Key Created" cancel="Okay" canCommit={keyInput.length > 0} onDismiss={clearKey}>
        <dl className="mt-5 sm:mt-6 text-left">
          <dt className="font-bold">Name:</dt><dd>{createdKey?.name}</dd>
          <dt className="font-bold mt-2">Address:</dt><dd>{createdKey?.address}</dd>
          <dt className="font-bold mt-2">Algorithm:</dt><dd>{createdKey?.algorithm}</dd>
          <dt className="font-bold mt-2 text-failure">Mnemoic (write this down):</dt><dd className="bg-gray-100 rounded p-4">{createdKey?.mnemonic}</dd>
        </dl>
      </Modal>
    </div>
  )
}

export default Keys
