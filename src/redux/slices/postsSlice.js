import { createSlice } from '@reduxjs/toolkit';

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    refreshToken: 0
  },
  reducers: {
    refreshRequested: (state) => {
      state.refreshToken += 1;
    }
  }
});

export const { refreshRequested } = postsSlice.actions;

export default postsSlice.reducer;