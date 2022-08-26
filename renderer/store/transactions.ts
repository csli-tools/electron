import { HYDRATE } from 'next-redux-wrapper'
import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit'

import { Fee, ModeInfo, TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import Long from 'long'

export interface DecodedTransaction {
  height: number
  hash: string
  code: number
  rawLog: string
  tx: {
    authInfo?: {
      signerInfos: DecodedSignerInfo[]
      fee?: Fee
    }
    body?: TxBody
    signatures: string[]
  }
  gasUsed: number
  gasWanted: number
}

export interface DecodedSignerInfo {
  publicKey?: any;
  modeInfo?: ModeInfo;
  sequence: Long;
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
