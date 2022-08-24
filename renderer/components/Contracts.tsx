import React, { useEffect } from 'react'
import Wasm from '../services/Wasm'
import { useAppSelector, useAppDispatch } from '../store/'
import { Contract, contractSelectors, contractActions } from '../store/contracts'

const Contracts: React.FC = () => {
  const contracts = useAppSelector((state) => {
    return contractSelectors.selectAll(state)
  })
  const appDispatch = useAppDispatch()

  useEffect(() => {
    Wasm.sharedInstance().client!.getCodes().then(codes => {
      const contracts = codes.map(async code => {
        return Wasm.sharedInstance().client!.getContracts(code.id)
      })
      Promise.all(contracts).then(contractAddresses => {
        const contracts: Contract[] = codes.map((code, index) => {
          return {
            id: code.id,
            knownAddresses: [...contractAddresses[index]]
          }
        })
        appDispatch(contractActions.upsertMany(contracts))
      })
    })
  }, [])

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Contracts</h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div>
          {contracts.map(contract => {
            return (
              <div key={contract.id}>
                {contract.id}
                {contract.knownAddresses.join(" ")}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Contracts
