import React, { useState, useCallback } from "react";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

import classNames from '../utils/classNames'
import { Block } from "../store/blocks";
import { transactionSelectors } from '../store/transactions'

interface FilledBlockProps {
	block: Block
  handleTransactionSelection: (hash: string) => void
  selectedTransactionHash: string
}

const FilledBlock: React.FC<FilledBlockProps> = ({ block, handleTransactionSelection, selectedTransactionHash }) => {

  const [selectedBlock, setSelectedBlock] = useState<boolean>(false)

  const handleBlockSelection = useCallback(() => {
    setSelectedBlock(!selectedBlock)
  }, [selectedBlock])

	return (
    <React.Fragment>
      <h2 className="cursor-pointer text-lg font-semibold text-seafoam-500 flex items-center space-x-2" onClick={handleBlockSelection}>
        {block.height}
        {(selectedBlock ? <ChevronDownIcon className="w-4 h-auto flex-shrink-0" /> : <ChevronRightIcon className="w-4 h-auto flex-shrink-0" />)}
      </h2>
      { selectedBlock && 
        <ul>
          { 
            block.transactionHashes.map(hash => {
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
    </React.Fragment>
	)
}

export default FilledBlock