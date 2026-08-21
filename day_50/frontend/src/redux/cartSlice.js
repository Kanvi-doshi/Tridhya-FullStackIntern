import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",

  initialState: [],

  reducers: {
    setCartItems: (state, action) => {
      return action.payload;
    },

    updateCartItemQuantity: (state, action) => {
      const cartItem = state.find((item) => item._id === action.payload.itemId);

      if (cartItem) {
        cartItem.quantity = action.payload.quantity;
      }
    },

    removeCartItemFromState: (state, action) => {
      return state.filter((item) => item._id !== action.payload);
    },

    clearCartState: () => {
      return [];
    },
  },
});

export const {
  setCartItems,
  updateCartItemQuantity,
  removeCartItemFromState,
  clearCartState,
} = cartSlice.actions;

export default cartSlice.reducer;
