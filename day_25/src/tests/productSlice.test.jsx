import productReducer, {
    fetchProducts,
  } from "../redux/productSlice";
  
  describe("productSlice", () => {
    test("should return initial state", () => {
      expect(productReducer(undefined, { type: "" })).toEqual({
        items: [],
        loading: false,
        error: null,
      });
    });
  
    test("should handle fetchProducts.pending", () => {
      const action = {
        type: fetchProducts.pending.type,
      };
  
      const state = productReducer(undefined, action);
  
      expect(state.loading).toBe(true);
    });
  
    test("should handle fetchProducts.fulfilled", () => {
      const products = [
        {
          id: 1,
          title: "iPhone",
        },
      ];
  
      const action = {
        type: fetchProducts.fulfilled.type,
        payload: products,
      };
  
      const state = productReducer(undefined, action);
  
      expect(state.loading).toBe(false);
      expect(state.items).toEqual(products);
    });
  
    test("should handle fetchProducts.rejected", () => {
      const action = {
        type: fetchProducts.rejected.type,
        error: {
          message: "Failed to fetch products",
        },
      };
  
      const state = productReducer(undefined, action);
  
      expect(state.loading).toBe(false);
      expect(state.error).toBe("Failed to fetch products");
    });
  });