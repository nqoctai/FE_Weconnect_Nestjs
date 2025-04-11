import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    accessToken: null,
    user: {}
}

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            state.accessToken = action.payload.accessToken;

        },
        logout: () => {
            return initialState;
        },
        saveUserInfor: (state, action) => {
            state.user = action.payload;
        }
    }
})

export const {login, logout, saveUserInfor} = authSlice.actions;
export default authSlice.reducer;