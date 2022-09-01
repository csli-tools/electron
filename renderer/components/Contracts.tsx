import React, { useEffect, useState } from 'react'
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'

import Wasm from '../services/Wasm'
import { useAppSelector, useAppDispatch } from '../store/'
import { Contract, ContractInstance, contractSelectors, contractActions } from '../store/contracts'
import { default as ContractInstanceElement } from './Contract'
import styles from '../styles/Contracts.module.css'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const Contracts: React.FC = () => {
  const [editedContractId, setEditedContractId] = useState<number | undefined>(undefined)
  const [selectedInstance, setSelectedInstance] = useState<ContractInstance | undefined>(undefined)
  
  const contracts = useAppSelector((state) => {
    return contractSelectors.selectAll(state)
  })
  const appDispatch = useAppDispatch()

  useEffect(() => {
    Wasm.sharedInstance().client!.getCodes().then(async codes => {
      const contracts = codes.map(code => {
        return Wasm.sharedInstance().client!.getContracts(code.id)
      })
      
      const contractAddressesForCodes = await Promise.all(contracts)
      const contractDetailsForCodes = contractAddressesForCodes.map(async codeAddresses => {
        const contractDetailPromises = codeAddresses.map(address => Wasm.sharedInstance().client!.getContract(address))
        return await Promise.all(contractDetailPromises)
      })
      Promise.all(contractDetailsForCodes).then(contractDetails => {
        const contracts: Contract[] = codes.map((code, index) => {
          return {
            id: code.id,
            instances: contractDetails[index].map(instance => {
              return {
                id: code.id,
                ...instance
              }
            })
          }
        })
        appDispatch(contractActions.upsertMany(contracts))
      })
    })
  }, [])

  return (
    <div className="relative">
      <div className={classNames(selectedInstance !== undefined ? "w-72 bg-seafoam-100" : "bg-white expanded w-full", "min-h-screen py-6 transition-all duration-500 overflow-y-scroll")}>
        <div className={classNames("px-4 sm:px-6 md:px-8")}>
          <h1 className={classNames(selectedInstance !== undefined ? "cursor-pointer text-xl" : "text-2xl", "flex font-semibold text-gray-900 transition-all duration-500")} onClick={() => setSelectedInstance(undefined)}>
            <ChevronLeftIcon className={classNames(selectedInstance !== undefined ? "w-4 opacity-100" : "w-0 opacity-0" , "h-auto transition-all duration-500")} />
            <span>Contracts</span>
          </h1>
        </div>
        <div className="w-full mx-auto px-4 sm:px-6 md:px-8">
          <ul className="divide-y divide-seafoam-100">
            {contracts.map(contract => {
              return (
                <li key={contract.id} className={classNames(selectedInstance !== undefined ? "py-0" : "py-5", "px-0 transition-all duration-500")}>
                  <div className="relative">
                    <h2 className="text-lg font-semibold text-seafoam-500 flex items-center space-x-2">
                      {!contract.nickname && editedContractId !== contract.id &&
                        <a href="#" className="text-seafoam-500 p-2 -ml-2" onClick={() => setEditedContractId(contract.id)}>Set nickname</a>
                      }
                      { (contract.nickname || editedContractId === contract.id) &&
                        <input className="p-2 -ml-2 bg-transparent" placeholder="Contract Nickname" autoFocus={editedContractId === contract.id} type="text" value={contract.nickname} onChange={(e) => {appDispatch(contractActions.setNickname({id: contract.id, nickname: e.target.value}))}} />
                      }
                    </h2>
                    {/* h-[3.5rem] is the sum total of the line-heights of the three subsequent headers, if they change font size, this value will need to be updated accordingly  */}
                    <div className={classNames(selectedInstance !== undefined ? "opacity-0 h-0" : " opacity-100 h-[3.5rem]", "overflow-hidden transition-all duration-500")}>
                      <h3 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                        <span>Contract Id: {contract.id}</span>
                      </h3>
                      <h3 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                        Instantiated at {contract.instances.length} {contract.instances.length === 1 ? "address" : "addresses"}
                      </h3>
                      <h4 className="text-xs font-semibold text-gray-500 flex items-center space-x-2">
                        (select an address to explore)
                      </h4>
                    </div>
                    
                    <ul>
                      {contract.instances.map(instance => {
                        return (
                          <li key={instance.address} className={classNames((selectedInstance !== undefined ? "border-transparent mt-0 mb-1" : "border-gray-200 mt-2 mb-2"), (selectedInstance?.address === instance.address ? "bg-seafoam-300" : "bg-transparent"), "flex items-center w-full justify-between border rounded p-2 cursor-pointer")} onClick={() => setSelectedInstance(instance)}>
                            <div className="truncate">
                              <div className={classNames(selectedInstance !== undefined ? "inline" : "block", "font-bold")}>{instance.label} </div>
                              <div className={classNames(selectedInstance !== undefined ? "inline" : "block", "truncate")}>{instance.address}</div>
                            </div>
                            <ChevronRightIcon className="w-4 h-auto flex-shrink-0" />
                          </li>
                        )
                      })}
                      {contract.instances.length === 0 && 
                        <li className={"border-transparent bg-transparent flex items-center w-full justify-between border rounded p-2 mt-0 mb-2"}>No Instances</li>
                      }
                    </ul>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
      
      <div className={classNames(styles.subpanelWidth, (selectedInstance !== undefined ? "left-72" : "left-full"), "transition-all duration-500 absolute top-0 h-screen overflow-y-scroll")}>
        {selectedInstance &&
          <ContractInstanceElement instance={selectedInstance} />
        }
      </div>
    </div>
  )
}

export default Contracts
