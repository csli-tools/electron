import React, { useState, useCallback } from 'react'

import { useAppSelector } from '../store/'
import { blockSelectors } from '../store/blocks'
import { Block } from '../store/blocks'
import TransactionHelper from '../services/TransactionHelper'
import Transaction from '../components/Transaction'

const Dashboard: React.FC = () => {

  const [selectedBlock, setSelectedBlock] = useState<Block | undefined>(undefined)
  const [selectedTransactionHash, setSelectedTransactionHash] = useState<string | undefined>(undefined)

  const blocks = useAppSelector((state) => {
    return blockSelectors.selectAll(state)
  })

  const handleTransactionSelection = useCallback((transactionHash) => {
    TransactionHelper.sharedInstance().saveTransaction(transactionHash).then(() => {
      setSelectedTransactionHash(transactionHash)
    })
  }, [selectedTransactionHash])
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Replace with your content */}
        <div className="py-4">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-80 overflow-scroll sm:px-1 py-1 mb-2">
            <h3 className="text-white">Blocks with Transactions:</h3>
            <ul>
              {blocks.map(block => {
                if (!(block.transactionHashes.length === 0)) {
                  return (
                    <li key={block.height} className="text-white" onClick={() => {setSelectedBlock(block)}}>
                      {block.height}
                    </li>
                  )
                }
              })}
            </ul>
            { selectedBlock &&
              <React.Fragment>
                <div className="border-t border-solid border-gray-200"></div>
                <h3 className="text-white">Transactions in block {selectedBlock.height}</h3>
                <ul>
                  { 
                    selectedBlock.transactionHashes.map(hash => {
                      return (
                        <li key={hash} className="text-white" onClick={() => {handleTransactionSelection(hash)}}>
                          {hash}
                        </li>
                      )
                    })
                  }
                </ul>
              </React.Fragment>
            }
          </div>
          <div className="border-4 border-dashed border-gray-200 rounded-lg overflow-scroll h-96 sm:px-1 py-1 my-2">
          {
            selectedTransactionHash &&
            <Transaction transactionHash={selectedTransactionHash} />
          }
          </div>
        </div>
        {/* /End replace */}
      </div>
    </div>
  )
}

export default Dashboard
