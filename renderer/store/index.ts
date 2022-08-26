import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { AnyAction } from 'redux'
import { createWrapper } from 'next-redux-wrapper'
import { configureStore, ThunkAction } from '@reduxjs/toolkit'
import { contractSlice } from './contracts'
import { blockSlice } from './blocks'
import { transactionSlice } from './transactions'
import { nextReduxCookieMiddleware, wrapMakeStore } from 'next-redux-cookie-wrapper'

let tempStore
const makeStore = wrapMakeStore(() => {
  tempStore = configureStore({
    reducer: {
      [contractSlice.name]: contractSlice.reducer,
      [blockSlice.name]: blockSlice.reducer,
      [transactionSlice.name]: transactionSlice.reducer,
    },
    devTools: true,
    middleware:  (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(
      nextReduxCookieMiddleware({
        subtrees: [contractSlice.name, blockSlice.name, transactionSlice.name],
      })
    ),
  })
  return tempStore
})

export type AppStore = ReturnType<typeof makeStore>
export type AppState = ReturnType<AppStore['getState']>

export const getStore = (): AppStore => {
  return tempStore
}

export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ReturnType = Promise<void>> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  AnyAction
>

// export an assembled wrapper
export const wrapper = createWrapper<AppStore>(makeStore, {debug: true});

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector
