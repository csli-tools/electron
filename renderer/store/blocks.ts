import { HYDRATE } from 'next-redux-wrapper'
import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit'

export interface Block {
  height: number
  transactions: Uint8Array[]
  transactionHashes: string[]
}

const blockEntity = createEntityAdapter<Block>({ selectId: (block: Block) => block.height })

export const blockSlice = createSlice({
  name: 'block',

  initialState: {
    blocks: blockEntity.getInitialState()
  },

  reducers: {
    upsert(state, action: PayloadAction<Block>) {
      blockEntity.upsertOne(state.blocks, action.payload)
    },
    upsertMany(state, action: PayloadAction<Block[]>) {
      blockEntity.upsertMany(state.blocks, action.payload)
    },
  },

  extraReducers: {
    [HYDRATE]: (state: any, action) => {
      return {
        ...state,
        ...action.payload.block,
      };
    },
  },
})

export const blockActions = blockSlice.actions
export type BlockSlice = {
  [blockSlice.name]: ReturnType<typeof blockSlice['reducer']>
}
export const blockSelectors = blockEntity.getSelectors<BlockSlice>(
  (state) => state[blockSlice.name].blocks
)
