import React, { useState, useCallback } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

import { useAppSelector } from '../store/'
import { blockSelectors } from '../store/blocks'
import { Block } from '../store/blocks'
import TransactionHelper from '../services/TransactionHelper'
import Transaction from './Transaction'
import FilledBlock from './FilledBlock'
import classNames from '../utils/classNames'
import styles from '../styles/Contracts.module.css'

const Dashboard: React.FC = () => {

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
    <div className="relative">
      <div className={classNames(selectedTransactionHash !== undefined ? "w-72 bg-seafoam-100" : "bg-white expanded w-full", "min-h-screen py-6 transition-all duration-500 overflow-y-scroll")}>
        <div className={classNames("px-4 sm:px-6 md:px-8")}>
          <h1 className={classNames(selectedTransactionHash !== undefined ? "cursor-pointer text-xl" : "text-2xl", "flex font-semibold text-gray-900 transition-all duration-500")} onClick={() => setSelectedTransactionHash(undefined)}>
            <ChevronLeftIcon className={classNames(selectedTransactionHash !== undefined ? "w-4 opacity-100" : "w-0 opacity-0" , "h-auto transition-all duration-500")} />
            <span>Blocks</span>
          </h1>
        </div>
        <div className="w-full mx-auto px-4 sm:px-6 md:px-8">
          <ul className="divide-y divide-seafoam-100">
            {blocks.map(block => {
              if (!(block.transactionHashes.length === 0)) {
                return (
                  <li key={block.height} className={classNames(selectedTransactionHash !== undefined ? "py-0" : "py-5", "px-0 transition-all duration-500")} >
                    <FilledBlock block={block} handleTransactionSelection={handleTransactionSelection} selectedTransactionHash={selectedTransactionHash} />
                  </li>
                )
              }
            })}
          </ul>
        </div>
      </div>

      <div className={classNames(styles.subpanelWidth, (selectedTransactionHash !== undefined ? "left-72" : "left-full"), "transition-all duration-500 absolute top-0 h-screen overflow-y-scroll")}>
        {
          selectedTransactionHash &&
          <Transaction transactionHash={selectedTransactionHash} />
        }
      </div>
    </div>
    // <div className="py-6">
    //   <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
    //     <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
    //   </div>
    //   <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
    //     {/* Replace with your content */}
    //     <div className="py-4">
    //       <div className="border-4 border-dashed border-gray-200 rounded-lg h-80 overflow-scroll sm:px-1 py-1 mb-2">
    //         <h3 className="text-white">Blocks with Transactions:</h3>
    //         <ul>
              // {blocks.map(block => {
              //   if (!(block.transactionHashes.length === 0)) {
              //     return (
              //       <li key={block.height} className="text-white" onClick={() => {setSelectedBlock(block)}}>
              //         {block.height}
              //       </li>
              //     )
              //   }
              // })}
    //         </ul>
            // { selectedBlock &&
            //   <React.Fragment>
            //     <div className="border-t border-solid border-gray-200"></div>
            //     <h3 className="text-white">Transactions in block {selectedBlock.height}</h3>
            //     <ul>
            //       { 
            //         selectedBlock.transactionHashes.map(hash => {
            //           return (
            //             <li key={hash} className="text-white" onClick={() => {handleTransactionSelection(hash)}}>
            //               {hash}
            //             </li>
            //           )
            //         })
            //       }
            //     </ul>
            //   </React.Fragment>
            // }
    //       </div>
    //       <div className="border-4 border-dashed border-gray-200 rounded-lg overflow-scroll h-96 sm:px-1 py-1 my-2">
          // {
          //   selectedTransactionHash &&
          //   <Transaction transactionHash={selectedTransactionHash} />
          // }
    //       </div>
    //     </div>
    //     {/* /End replace */}
    //   </div>
    // </div>
  )
}

export default Dashboard
