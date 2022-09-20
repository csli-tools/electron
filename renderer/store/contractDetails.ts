import { HYDRATE } from 'next-redux-wrapper'
import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit'
import { JSONSchema7TypeName } from 'json-schema'

export interface Query {
  key: string
  parameters: QueryParameter[]
}

export interface QueryParameter {
  key: string
  required: boolean
  valueType: JSONSchema7TypeName | JSONSchema7TypeName[]
  allowedValues?: any[]
  tags: string[]
}

export interface ContractDetails {
  id: number
  inits: any[] // todo: fill this out
  executes: Query[]
  queries: Query[]
}

const contractDetailsEntity = createEntityAdapter<ContractDetails>()

export const contractDetailsSlice = createSlice({
  name: 'contractDetails',

  initialState: {
    contractDetails: contractDetailsEntity.getInitialState()
  },

  reducers: {
    upsert(state, action: PayloadAction<ContractDetails>) {
      contractDetailsEntity.upsertOne(state.contractDetails, action.payload)
    },
    upsertMany(state, action: PayloadAction<ContractDetails[]>) {
      contractDetailsEntity.upsertMany(state.contractDetails, action.payload)
    },
  },

  extraReducers: {
    [HYDRATE]: (state: any, action) => {
      return {
        ...state,
        ...action.payload.contractDetails,
      };
    },
  },
})

export const contractDetailsActions = contractDetailsSlice.actions
export type ContractDetailsSlice = {
  [contractDetailsSlice.name]: ReturnType<typeof contractDetailsSlice['reducer']>
}
export const contractDetailsSelectors = contractDetailsEntity.getSelectors<ContractDetailsSlice>(
  (state) => state[contractDetailsSlice.name].contractDetails
)
