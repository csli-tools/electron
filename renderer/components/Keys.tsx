import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'

import Wasm from '../services/Wasm'
import { useAppSelector, useAppDispatch } from '../store/'
import { Contract, ContractInstance, contractSelectors, contractActions } from '../store/contracts'
import { default as ContractInstanceElement } from './Contract'
import styles from '../styles/Subpanel.module.css'
import classNames from '../utils/classNames'

const Keys: React.FC = () => {
  
  const authorize = useCallback(() => {
    axios.get("http://localhost:8889/keys").then(response => {
      console.log(response)
    })
  }, [])

  return (
    <div className="h-screen p-6">
      <div className="h-full flex flex-col justify-center items-center text-center">
      <div className="w-2/3 space-y-4">
        <p>In order to maximize compatibility with <span className="italic rounded bg-seafoam-100 px-1">wasmd</span>, CSLI ships with a small helper utility called <span className="italic rounded bg-seafoam-100 px-1">key-helper</span>. If you authorize it, it will interface with your operating system’s secure store and periodically access private keys to sign transactions that you initiate in CSLI. If you have exsisting keys in wasmd, you‘ll be immediately prompted for access to each of them upon authorization.</p>
        <button className="rounded border p-2">Authorize</button>
      </div>
      </div>
    </div>
  )
}

export default Keys
