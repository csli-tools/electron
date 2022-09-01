import React, { useState, useCallback } from 'react'

import { useAppSelector } from '../store/'
import { blockSelectors } from '../store/blocks'
import TransactionHelper from '../services/TransactionHelper'
import Transaction from './Transaction'
import FilledBlock from './FilledBlock'
import classNames from '../utils/classNames'
import styles from '../styles/Subpanel.module.css'

const Dashboard: React.FC = () => {

  const [selectedTransactionHash, setSelectedTransactionHash] = useState<string | undefined>(undefined)

  const blocks = useAppSelector((state) => {
    const blocks = blockSelectors.selectAll(state)
    return [...blocks].reverse()
  })

  const handleTransactionSelection = useCallback((transactionHash) => {
    TransactionHelper.sharedInstance().saveTransaction(transactionHash).then(() => {
      setSelectedTransactionHash(transactionHash)
    })
  }, [selectedTransactionHash])
  
  return (
    <div className="relative">
      <div className="w-72 bg-seafoam-100 h-screen py-6 transition-all duration-500 overflow-y-scroll">
        <div className="px-4 sm:px-6 md:px-8">
          <h1 className="cursor-pointer text-xl flex font-semibold text-gray-900 transition-all duration-500" onClick={() => setSelectedTransactionHash(undefined)}>
            <span className="mb-4">Blocks</span>
          </h1>
        </div>
        <div className="w-full mx-auto px-4 sm:px-6 md:px-8">
          <ul className="divide-y divide-seafoam-100">
            {blocks.map(block => {
              if (!(block.transactionHashes.length === 0)) {
                return (
                  <li key={block.height} className="py-0 px-0" >
                    <FilledBlock block={block} handleTransactionSelection={handleTransactionSelection} selectedTransactionHash={selectedTransactionHash} />
                  </li>
                )
              }
            })}
          </ul>
        </div>
      </div>

      <div className={classNames(styles.subpanelWidth, "left-72 transition-all duration-500 absolute top-0 h-screen overflow-y-scroll")}>
        <Transaction transactionHash={selectedTransactionHash} />
      </div>
    </div>
  )
}

export default Dashboard
