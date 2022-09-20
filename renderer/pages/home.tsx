import type { NextPage } from 'next'
import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import {
  ReceiptPercentIcon,
  CodeBracketIcon,
  KeyIcon
} from '@heroicons/react/24/outline'

import TransactionHelper from '../services/TransactionHelper'

import styles from '../styles/Home.module.css'
import Dashboard from '../components/Dashboard'
import Contracts from '../components/Contracts'
import Keys from '../components/Keys'
import Wasm from '../services/Wasm'
import Logo from '../components/svg/Logo.svg'

enum Tab {
  Transactions,
  Contracts,
  Keys
}

const navigation = [
  { tab:Tab.Transactions, name: 'Dashboard', href: '#', icon: ReceiptPercentIcon },
  { tab:Tab.Contracts, name: 'Contracts', href: '#', icon: CodeBracketIcon },
  { tab:Tab.Keys, name: 'Keys', href: '#', icon: KeyIcon },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const Home: NextPage = () => {
  const [tab, setTab] = useState(Tab.Transactions)
  const [client, setClient] = useState<CosmWasmClient | undefined>() // this component will validate our cosmwasmclient and block any rendering if it doesn't connect, all other components can simply assume that it exists and is connected
  const [connectionAttempted, setConnectionAttempted] = useState(false)

  useEffect(() => {
    Wasm.sharedInstance().connect().then(client => {
      TransactionHelper.sharedInstance(client).start()
      setClient(client)
      setConnectionAttempted(true)
      console.log(client)
    }).catch(error => {
      setConnectionAttempted(true)
    })
  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>CSLI</title>
        <meta name="description" content="Pronounced sizzly" />
        <link rel="icon" href="/favicon.ico" />
      </Head>


      {client &&
        <div className="min-h-screen">
          <div className="flex w-64 flex-col fixed inset-y-0">
            {/* Sidebar component, swap this element with another sidebar if you like */}
            <div className="flex flex-col flex-grow pt-8 bg-seafoam-500 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4 text-white space-x-4">
                <Logo className="h-8 w-auto" />
                <span>CSLI</span>
              </div>
              <div className="mt-8 flex-1 flex flex-col">
                <nav className="flex-1 px-4 pb-4 space-y-2">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setTab(item.tab)}
                      className={classNames(
                        tab === item.tab ? 'bg-seafoam-900 text-white' : 'text-seafoam-100 hover:bg-seafoam-700',
                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                      )}
                    >
                      <item.icon className="mr-3 flex-shrink-0 h-6 w-6 text-seafoam-300" aria-hidden="true" />
                      {item.name}
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          </div>
          <div className="pl-64 flex flex-col flex-1">
            <main>
              {tab === Tab.Transactions &&
                <Dashboard />
              }
              {tab === Tab.Contracts &&
                <Contracts />
              }
              {tab === Tab.Keys &&
                <Keys />
              }
            </main>
          </div>
        </div>
      }
      {!client && connectionAttempted &&
        <div>
          Failed to connect to wasm
        </div>
      }
      <div id="modal-root" />
    </div>
  )
}

export default Home
