import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",

  initialState: [],

  reducers: {
    addToCart: (state, action) => {
      const item = state.find((product) => product.id === action.payload.id);

      if (item) {
        item.quantity += 1;
      } else {
        state.push({
          ...action.payload,
          quantity: 1,
        });
      }
    },
    increaseQty: (state, action) => {
      const item = state.find((product) => product.id === action.payload);

      if (item) {
        item.quantity += 1;
      }
    },
    decreaseQty: (state, action) => {
      const item = state.find((product) => product.id === action.payload);

      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
    },
    removeFromCart: (state, action) => {
      return state.filter((product) => product.id !== action.payload);
    },
    clearCart: () => {
      return [];
    },
  },
});

export const { addToCart, increaseQty, decreaseQty, removeFromCart, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;
