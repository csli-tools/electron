import type { NextPage } from 'next'
import { useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Dashboard from '../components/Dashboard'
import Contracts from '../components/Contracts'

enum Tab {
  Transactions,
  Contracts
}

const Home: NextPage = () => {
  const [tab, setTab] = useState<Tab>(Tab.Transactions)
  
  return (
    <div className={styles.container}>
      <Head>
        <title>CSLI</title>
        <meta name="description" content="Pronounced sizzly" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <button className={`rounded-full bg-sky-${tab === Tab.Transactions ? 500 : 300} p-2 m-4`} onClick={() => setTab(Tab.Transactions)}>Dashboard</button>
      <button className={`rounded-full bg-sky-${tab === Tab.Contracts ? 500 : 300} p-2 m-4`} onClick={() => setTab(Tab.Contracts)}>Contracts</button>

      {tab === Tab.Transactions &&
        <Dashboard />
      }
      {
        tab === Tab.Contracts &&
        <Contracts />
      }
    </div>
  )
}

export default Home
