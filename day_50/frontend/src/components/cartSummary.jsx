import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { toast } from "react-toastify";
import { clearCartState } from "../redux/cartSlice";
import { deleteEntireCart } from "../service/cart.service";

import { X, Trash2, CreditCard } from "lucide-react";

function CartSummary({ setShowBill }) {
  const cartItems = useSelector((state) => state.cart);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const totalItems = useMemo(
    () => cartItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0),
    [cartItems],
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, cartItem) => sum + cartItem.product.price * cartItem.quantity,
        0,
      ),
    [cartItems],
  );

  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  const handleClearCart = async () => {
    try {
      await deleteEntireCart();

      dispatch(clearCartState());

      toast.success("Cart cleared successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white w-[500px] h-[550px] overflow-y-auto rounded-xl shadow-xl p-5">
        <div className="flex justify-between items-center mt-6">
          <h2 className="text-xl font-bold">Cart Summary</h2>

          <button
            onClick={() => setShowBill(false)}
            className="text-2xl font-bold text-gray-500 hover:text-red-500"
          >
            <X size={24} />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <p className="text-center text-gray-500 py-6">Your cart is empty.</p>
        ) : (
          <>
            <table className="w-full mt-8">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Product</th>

                  <th className="text-center py-2">Qty</th>

                  <th className="text-right py-2">Price</th>
                </tr>
              </thead>

              <tbody>
                {cartItems.map((cartItem) => (
                  <tr key={cartItem._id} className="border-b">
                    <td className="py-2">{cartItem.product.name}</td>

                    <td className="text-center">{cartItem.quantity}</td>

                    <td className="text-right">
                      ₹{cartItem.product.price * cartItem.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Total Items</span>
                <span>{totalItems}</span>
              </div>

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              <div className="flex justify-between">
                <span>GST (18%)</span>
                <span>₹{gst}</span>
              </div>

              <hr />

              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>

                <span className="text-green-600">₹{total}</span>
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-6 ">
              <button
                onClick={handleClearCart}
                className="bg-red-500 text-white px-8 py-2 rounded-lg hover:bg-red-600 flex gap-2 items-center justify-center"
              >
                <Trash2 size={24} />
                Clear Cart
              </button>

              <button
                onClick={() => navigate("/payment")}
                className="bg-green-600 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-700 transition flex gap-2 items-center justify-center"
              >
                <CreditCard size={24} />
                Pay Now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CartSummary;
