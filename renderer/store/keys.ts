import { HYDRATE } from 'next-redux-wrapper'
import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit'

export interface Key {
  name: string
  address: string
  algorithm: string
}

const keyEntity = createEntityAdapter<Key>({ selectId: (key: Key) => key.name })

export const keySlice = createSlice({
  name: 'keys',

  initialState: {
    keys: keyEntity.getInitialState()
  },

  reducers: {
    upsert(state, action: PayloadAction<Key>) {
      keyEntity.upsertOne(state.keys, action.payload)
    },
    upsertMany(state, action: PayloadAction<Key[]>) {
      keyEntity.upsertMany(state.keys, action.payload)
    },
    remove(state, action: PayloadAction<string>) {
      keyEntity.removeOne(state.keys, action.payload)
    },
  },

  extraReducers: {
    [HYDRATE]: (state: any, action) => {
      return {
        ...state,
        ...action.payload.keys,
      };
    },
  },
})

export const keyActions = keySlice.actions
export type KeySlice = {
  [keySlice.name]: ReturnType<typeof keySlice['reducer']>
}
export const keySelectors = keyEntity.getSelectors<KeySlice>(
  (state) => state[keySlice.name].keys
)
