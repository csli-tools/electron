import React, { useState, useCallback, useMemo } from 'react'
import { MagnifyingGlassIcon, XCircleIcon } from '@heroicons/react/20/solid'

import { useAppSelector } from '../store/'
import { blockSelectors } from '../store/blocks'
import TransactionHelper from '../services/TransactionHelper'
import Transaction from './Transaction'
import FilledBlock from './FilledBlock'
import classNames from '../utils/classNames'
import styles from '../styles/Subpanel.module.css'

const Dashboard: React.FC = () => {

  const [selectedTransactionHash, setSelectedTransactionHash] = useState<string | undefined>(undefined)
  const [selectedBlockHeight, setSelectedBlockHeight] = useState<number | undefined>(undefined)
  const [query, setQuery] = useState<string>("")

  const blocks = useAppSelector((state) => {
    const blocks = blockSelectors.selectAll(state)
    return [...blocks].reverse()
  })

  const handleTransactionSelection = useCallback((transactionHash) => {
    TransactionHelper.sharedInstance().saveTransaction(transactionHash).then(() => {
      setSelectedTransactionHash(transactionHash)
    })
  }, [selectedTransactionHash])

  const changeQuery = useCallback((e: any) => {
    setQuery(e.target.value)
  }, [query])

  const search = useCallback((e: any) => {
    e.preventDefault()
    if (query === "") {
      clearState()
      return
    }
    if (query.match(/^[0-9]+$/)?.length) {
      getBlock(parseInt(query))
    } else {
      getTransaction(query)
    }
  }, [query])

  const getTransaction = useCallback((query: string) => {
    TransactionHelper.sharedInstance().client.getTx(query).then((tx) => {
      setSelectedTransactionHash(tx.hash)
    }).catch(() => {
      setSelectedTransactionHash(undefined)
    })
  }, [])

  const getBlock = useCallback((query: number) => {
    TransactionHelper.sharedInstance().client.getBlock(query).then( async () => {
      await TransactionHelper.sharedInstance().saveBlock(query)
      setSelectedBlockHeight(query)
    }).catch((error) => {
      console.log(error)
      setSelectedBlockHeight(undefined)
    })
  }, [])

  const clearState = useCallback(() => {
    setQuery("")
    setSelectedBlockHeight(undefined)
    setSelectedTransactionHash(undefined)
  }, [])

  const filteredBlocks = useMemo(() => {
    return selectedBlockHeight === undefined ? blocks : blocks.filter(block => block.height === selectedBlockHeight)
  }, [blocks, selectedBlockHeight])
  
  return (
    <div className="relative">
      <div className="w-72 bg-seafoam-100 h-screen pb-6 transition-all duration-500 overflow-y-scroll">
        <div className="px-4 sm:px-6 md:px-8 sticky top-0 bg-seafoam-100 pt-6">
          <h1 className="text-xl flex font-semibold text-gray-900">
            <span className="mb-4">Blocks</span>
          </h1>
          <form className="flex mb-4 focus:outline-1" onSubmit={search}>
            <input className="w-full block border focus:outline-0 border-gray-300 border-r-0 rounded-none rounded-l-md text-sm px-1" type="text" placeholder="tx hash / block height" value={query} onChange={changeQuery} />
            { query.length > 0 &&
              <XCircleIcon className="w-[20px] text-seafoam-500 bg-white border border-gray-300 border-x-0 pr-1 cursor-pointer" onClick={clearState} />
            }
            <span className="rounded-r-md border border-gray-300 bg-gray-50 p-2 cursor-pointer sm:text-sm" onClick={search}>
              <MagnifyingGlassIcon className="w-[20px] text-seafoam-500" />
            </span>
          </form>
        </div>
        <div className="w-full mx-auto px-4 sm:px-6 md:px-8">
          <ul className="divide-y divide-seafoam-100">
            {filteredBlocks.map(block => {
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
