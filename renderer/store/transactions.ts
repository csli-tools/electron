import { HYDRATE } from 'next-redux-wrapper'
import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit'
import { ModeInfo } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin'
import { Any } from 'cosmjs-types/google/protobuf/any'

export interface DecodedTransaction {
  height: number
  hash: string
  code: number
  rawLog: string
  tx: {
    authInfo?: {
      signerInfos: DecodedSignerInfo[]
      fee?: DecodedFee
    }
    body?: DecodedTxBody
    signatures: string[]
  }
  gasUsed: number
  gasWanted: number
}

export interface DecodedSignerInfo {
  publicKey?: any
  modeInfo?: ModeInfo
  sequence: string
}

export interface DecodedFee {
  amount: Coin[]
  granter: string
  payer: string
  gasLimit: string
}

export interface DecodedTxBody {
  messages: Any[]
  memo: string
  timeoutHeight: string
  extensionOptions: Any[]
  nonCriticalExtensionOptions: Any[]
}

const transactionEntity = createEntityAdapter<DecodedTransaction>({ selectId: (transaction: DecodedTransaction) => transaction.hash })

export const transactionSlice = createSlice({
  name: 'transaction',

  initialState: {
    transactions: transactionEntity.getInitialState()
  },

  reducers: {
    upsert(state, action: PayloadAction<DecodedTransaction>) {
      transactionEntity.upsertOne(state.transactions, action.payload)
    },
    upsertMany(state, action: PayloadAction<DecodedTransaction[]>) {
      transactionEntity.upsertMany(state.transactions, action.payload)
    },
  },

  extraReducers: {
    [HYDRATE]: (state: any, action) => {
      return {
        ...state,
        ...action.payload.transaction,
      };
    },
  },
})

export const transactionActions = transactionSlice.actions
export type TransactionSlice = {
  [transactionSlice.name]: ReturnType<typeof transactionSlice['reducer']>
}
export const transactionSelectors = transactionEntity.getSelectors<TransactionSlice>(
  (state) => state[transactionSlice.name].transactions
)
