import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { Action, AnyAction } from 'redux'
import { createWrapper } from 'next-redux-wrapper'
import { configureStore, ThunkAction } from '@reduxjs/toolkit'
import { contractSlice } from './contracts'
import { nextReduxCookieMiddleware, wrapMakeStore } from 'next-redux-cookie-wrapper'

const makeStore = wrapMakeStore( () =>
  configureStore({
    reducer: {
        [contractSlice.name]: contractSlice.reducer,
    },
    devTools: true,
    middleware:  (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(
      nextReduxCookieMiddleware({
        subtrees: [contractSlice.name],
      })
    ),
  })
)

export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore['getState']>;

export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ReturnType = Promise<void>> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  AnyAction
>;


// export an assembled wrapper
export const wrapper = createWrapper<AppStore>(makeStore, {debug: true});

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector
