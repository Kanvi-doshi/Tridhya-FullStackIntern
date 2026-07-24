import cartReducer, {
    addToCart,
    increaseQty,
    decreaseQty,
    removeFromCart,
    clearCart,
  } from "../redux/cartSlice";
  
  describe("cartSlice", () => {
    test("should return initial state", () => {
      expect(cartReducer(undefined, { type: "" })).toEqual([]);
    });
  
    test("should add item to cart", () => {
      const item = {
        id: 1,
        title: "iPhone",
        price: 1000,
      };
  
      const state = cartReducer([], addToCart(item));
  
      expect(state.length).toBe(1);
      expect(state[0].quantity).toBe(1);
    });
  
    test("should increase quantity if item already exists", () => {
      const initialState = [
        {
          id: 1,
          title: "iPhone",
          price: 1000,
          quantity: 1,
        },
      ];
  
      const state = cartReducer(initialState, addToCart(initialState[0]));
  
      expect(state[0].quantity).toBe(2);
    });
  
    test("should increase quantity", () => {
      const initialState = [
        {
          id: 1,
          quantity: 1,
        },
      ];
  
      const state = cartReducer(initialState, increaseQty(1));
  
      expect(state[0].quantity).toBe(2);
    });
  
    test("should decrease quantity", () => {
      const initialState = [
        {
          id: 1,
          quantity: 2,
        },
      ];
  
      const state = cartReducer(initialState, decreaseQty(1));
  
      expect(state[0].quantity).toBe(1);
    });
  
    test("should remove item from cart", () => {
      const initialState = [
        {
          id: 1,
          quantity: 1,
        },
      ];
  
      const state = cartReducer(initialState, removeFromCart(1));
  
      expect(state).toEqual([]);
    });
  
    test("should clear cart", () => {
      const initialState = [
        {
          id: 1,
          quantity: 1,
        },
      ];
  
      const state = cartReducer(initialState, clearCart());
  
      expect(state).toEqual([]);
    });
  });