import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import configuratorReducer from './configuratorSlice.js'

const persistConfig = {
  key: 'configurator',
  storage,
  whitelist: ['configurator'],
}

const persistedReducer = persistReducer(persistConfig, configuratorReducer)

export const store = configureStore({
  reducer: {
    configurator: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/PAUSE', 'persist/REGISTER'],
        ignoredPaths: ['configurator.parts'],
      },
    }),
})

export const persistor = persistStore(store)
