import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
};

export const appSlice = createSlice({
  name: "appSlice",
  initialState: initialState,
  reducers: {
    changeLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

const { reducer, actions } = appSlice;
export const { changeLoading } = actions;
export default reducer;
