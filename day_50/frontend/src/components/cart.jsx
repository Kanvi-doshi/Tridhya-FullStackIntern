import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { X, Plus, Minus, ShoppingCart } from "lucide-react";

import {
  setCartItems,
  updateCartItemQuantity,
  removeCartItemFromState,
} from "../redux/cartSlice";

import {
  fetchUserCart,
  changeCartItemQuantity,
  deleteCartItem,
} from "../service/cart.service";

function Cart({ setShowCart }) {
  const cartItems = useSelector((state) => state.cart);

  const dispatch = useDispatch();

  // Load cart from backend when Cart opens
  useEffect(() => {
    const loadCart = async () => {
      try {
        const response = await fetchUserCart();

        dispatch(setCartItems(response.cart.items));
      } catch (error) {
        toast.error(error.message);
      }
    };

    loadCart();
  }, [dispatch]);

  const totalItems = cartItems.reduce(
    (sum, cartItem) => sum + cartItem.quantity,
    0,
  );

  // Increase quantity
  const handleIncreaseQuantity = async (cartItem) => {
    try {
      const newQuantity = cartItem.quantity + 1;
      // Update backend
      await changeCartItemQuantity(cartItem.product._id, newQuantity);

      // Update Redux
      dispatch(
        updateCartItemQuantity({
          itemId: cartItem._id,
          quantity: newQuantity,
        }),
      );
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Decrease quantity
  const handleDecreaseQuantity = async (cartItem) => {
    if (cartItem.quantity <= 1) {
      return;
    }

    try {
      const newQuantity = cartItem.quantity - 1;

      await changeCartItemQuantity(cartItem.product._id, newQuantity);
      dispatch(
        updateCartItemQuantity({
          itemId: cartItem._id,
          quantity: newQuantity,
        }),
      );
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Remove item
  const handleRemoveItem = async (cartItem) => {
    try {
      // Remove from backend
      await deleteCartItem(cartItem.product._id);

      // Remove from Redux
      dispatch(removeCartItemFromState(cartItem._id));

      toast.error(`${cartItem.product.name} removed from cart!`, {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl w-[500px] max-h-[80vh] overflow-y-auto relative">
        <button
          onClick={() => setShowCart(false)}
          className="absolute top-3 right-4 text-2xl font-bold"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 flex gap-2 items-center ">
          <ShoppingCart size={24} />
          Shopping Cart ({totalItems})
        </h2>

        {cartItems.length === 0 ? (
          <p className="text-gray-500">Cart is empty</p>
        ) : (
          <div className="space-y-4">
            {cartItems.map((cartItem) => (
              <div key={cartItem._id} className="border rounded-xl p-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold line-clamp-1">
                      {cartItem.product.name}
                    </h3>

                    <p className="text-gray-500">₹{cartItem.product.price}</p>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(cartItem)}
                    className="bg-red-500 text-white px-3 py-1 rounded-xl"
                  >
                    Remove
                  </button>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() => handleDecreaseQuantity(cartItem)}
                    className="bg-gray-200 px-3 py-1 rounded"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="font-semibold">{cartItem.quantity}</span>

                  <button
                    onClick={() => handleIncreaseQuantity(cartItem)}
                    className="bg-gray-200 px-3 py-1 rounded"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
