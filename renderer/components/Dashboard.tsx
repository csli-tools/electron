import React, { useState, useCallback } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

import { useAppSelector } from '../store/'
import { blockSelectors } from '../store/blocks'
import { Block } from '../store/blocks'
import TransactionHelper from '../services/TransactionHelper'
import Transaction from './Transaction'
import classNames from '../utils/classNames'
import styles from '../styles/Contracts.module.css'

const Dashboard: React.FC = () => {

  const [selectedBlock, setSelectedBlock] = useState<Block | undefined>(undefined)
  const [selectedTransactionHash, setSelectedTransactionHash] = useState<string | undefined>(undefined)

  const blocks = useAppSelector((state) => {
    return blockSelectors.selectAll(state)
  })

  const handleBlockSelection = useCallback((block) => {
    selectedBlock === block ? setSelectedBlock(undefined) : setSelectedBlock(block)
  }, [selectedBlock])

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
                    <h2 className="cursor-pointer text-lg font-semibold text-seafoam-500 flex items-center space-x-2" onClick={() => {handleBlockSelection(block)}}>
                      {block.height}
                      {(selectedBlock === block ? <ChevronDownIcon className="w-4 h-auto flex-shrink-0" /> : <ChevronRightIcon className="w-4 h-auto flex-shrink-0" />)}
                    </h2>
                    { (selectedBlock === block) && 
                      <ul>
                        { 
                          selectedBlock.transactionHashes.map(hash => {
                            return (
                              <li key={hash} className={classNames((selectedTransactionHash !== undefined ? "border-transparent mt-0 mb-1" : "border-gray-200 mt-2 mb-2"), (selectedTransactionHash === hash ? "bg-seafoam-300" : "bg-transparent"), "flex items-center w-full justify-between border rounded p-2 cursor-pointer text-gray-900")} onClick={() => handleTransactionSelection(hash)}>
                                <div className="truncate">{hash}</div>
                                <ChevronRightIcon className="w-4 h-auto flex-shrink-0" />
                              </li>
                            )
                          })
                        }
                      </ul>
                    }
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
