import { HYDRATE } from 'next-redux-wrapper'
import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit'

export interface Contract {
  id: number
  instances: ContractInstance[]
  nickname?: string
}
export interface ContractInstance {
  address: string
  admin?: string
  label: string
  creator: string
  ibcPortId?: string
}

const contractEntity = createEntityAdapter<Contract>()

export const contractSlice = createSlice({
  name: 'contract',

  initialState: {
    contracts: contractEntity.getInitialState()
  },

  reducers: {
    upsert(state, action: PayloadAction<Contract>) { 
      contractEntity.upsertOne(state.contracts, action.payload)
    },
    upsertMany(state, action: PayloadAction<Contract[]>) { 
      contractEntity.upsertMany(state.contracts, action.payload)
    },
    setNickname(state, action: PayloadAction<{id: number, nickname?: string}>) {
      contractEntity.updateOne(state.contracts, {
        id: action.payload.id,
        changes: {
          nickname: action.payload.nickname
        }
      })
    },
  },

  extraReducers: {
    [HYDRATE]: (state: any, action) => {
      return {
        ...state,
        ...action.payload.contract,
      };
    },
  },
})

export const contractActions = contractSlice.actions
export type ContractSlice = {
  [contractSlice.name]: ReturnType<typeof contractSlice['reducer']>
}
export const contractSelectors = contractEntity.getSelectors<ContractSlice>(
  (state) => state[contractSlice.name].contracts
)
