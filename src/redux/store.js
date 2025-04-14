import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "@redux/slices/authSlice";
import snackBarReducer from "@redux/slices/snackbarSlice";
import settingsReducer from "@redux/slices/settingsSlice";
import dialogReducer from "@redux/slices/dialogSlice";
import postsReducer from "@redux/slices/postsSlice";

import { rootApi } from "@services/rootApi";
import storage from "redux-persist/lib/storage";
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from "redux-persist";
import { logOutMiddleware } from "@redux/middlewares";

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    blacklist: [rootApi.reducerPath,
        'dialog', 'settings'
        ],
}

const persistedReducer = persistReducer(persistConfig, combineReducers({
    auth: authReducer,
    snackbar: snackBarReducer,
    settings: settingsReducer,
    dialog: dialogReducer,
    posts: postsReducer,
    [rootApi.reducerPath]: rootApi.reducer
}))

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware({
            serializableCheck: {
                ignoreActions: [
                    FLUSH,
                    REHYDRATE,
                    PAUSE,
                    PERSIST,
                    PURGE,
                    REGISTER,
                ]
            }
        }).concat(logOutMiddleware,rootApi.middleware);
    }
})

export const persistor = persistStore(store);