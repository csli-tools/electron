import React, { useState, useCallback, useEffect } from 'react'

import Wasm from '../services/Wasm'

interface BalanceProps {
  address: string
}

const Balance: React.FC<BalanceProps> = ({address}) => {
  const [balance, setBalance] = useState("0")
  const getBalance = useCallback(async () => {
    const coin = await Wasm.sharedInstance().client.getBalance(address, "stake")
    setBalance(coin.amount)
  }, [address])
  
  useEffect(() => {
    getBalance()
  }, [getBalance])
  return (
    <div>
      {balance}
    </div>
  )
}

export default Balance
