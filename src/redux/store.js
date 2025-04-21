import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "@redux/slices/authSlice";
import snackBarReducer from "@redux/slices/snackbarSlice";
import settingsReducer from "@redux/slices/settingsSlice";
import dialogReducer from "@redux/slices/dialogSlice";
import postsReducer from "@redux/slices/postsSlice";
import storage from "redux-persist/lib/storage";
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from "redux-persist";

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    blacklist: [
        'dialog', 'settings'
        ],
}

const persistedReducer = persistReducer(persistConfig, combineReducers({
    auth: authReducer,
    snackbar: snackBarReducer,
    settings: settingsReducer,
    dialog: dialogReducer,
    posts: postsReducer,
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
        })
    }
})

export const persistor = persistStore(store);