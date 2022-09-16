import React, { useState, useCallback } from "react";
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

import classNames from '../utils/classNames'
import { Block } from "../store/blocks";

interface FilledBlockProps {
  block: Block
  handleTransactionSelection: (hash: string) => void
  selectedTransactionHash: string
}

const FilledBlock: React.FC<FilledBlockProps> = ({ block, handleTransactionSelection, selectedTransactionHash }) => {

  const [selectedBlock, setSelectedBlock] = useState<boolean>(true)

  const handleBlockSelection = useCallback(() => {
    setSelectedBlock(!selectedBlock)
  }, [selectedBlock])

	return (
    <React.Fragment>
      <h2 className="cursor-pointer text-lg font-semibold text-seafoam-500 flex items-center space-x-2" onClick={handleBlockSelection}>
        <span>{block.height}</span>
        {(selectedBlock ? <ChevronDownIcon className="w-4 flex-shrink-0" /> : <ChevronRightIcon className="w-4 flex-shrink-0" />)}
      </h2>
      <div style={{height: selectedBlock ? (block.transactionHashes.length * 2.5) + "rem" : 0 }} className="overflow-hidden transition-all duration-500">
        <ul>
          { 
            block.transactionHashes.map(hash => {
              return (
                <li key={hash} className={classNames((selectedTransactionHash === hash ? "bg-seafoam-300" : "bg-transparent"), "border-transparent flex items-center w-full justify-between border rounded px-2 py-4 cursor-pointer text-gray-900 h-10")} onClick={() => handleTransactionSelection(hash)}>
                  <div className="truncate">{hash}</div>
                  <ChevronRightIcon className="w-4 flex-shrink-0" />
                </li>
              )
            })
          }
        </ul>
      </div>
    </React.Fragment>
	)
}

export default FilledBlock
