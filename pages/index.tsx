import type { NextPage } from 'next'
import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'

import styles from '../styles/Home.module.css'
import Dashboard from '../components/Dashboard'
import Contracts from '../components/Contracts'
import Wasm from '../services/Wasm'

enum Tab {
  Transactions,
  Contracts
}

const Home: NextPage = () => {
  const [tab, setTab] = useState<Tab>(Tab.Transactions)
  const [client, setClient] = useState<CosmWasmClient | undefined>() // this component will validate our cosmwasmclient and block any rendering if it doesn't connect, all other components can simply assume that it exists and is connected
  const [connectionAttempted, setConnectionAttempted] = useState(false)
    
  useEffect(() => {
    Wasm.sharedInstance().connect().then(client => {
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
        <React.Fragment>
          <button className={`rounded-full ${tab === Tab.Transactions ? "bg-sky-500" : "bg-sky-300"} p-2 m-4`} onClick={() => setTab(Tab.Transactions)}>Dashboard</button>
          <button className={`rounded-full ${tab === Tab.Contracts ? "bg-sky-500" : "bg-sky-300"} p-2 m-4`} onClick={() => setTab(Tab.Contracts)}>Contracts</button>
          {tab === Tab.Transactions &&
            <Dashboard />
          }
          {
            tab === Tab.Contracts &&
            <Contracts />
          }
        </React.Fragment>
      }
      {!client && connectionAttempted &&
        <div>
          Failed to connect to wasm
        </div>
      }
    </div>
  )
}

export default Home
