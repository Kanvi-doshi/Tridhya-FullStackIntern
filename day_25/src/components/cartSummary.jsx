import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../redux/cartSlice";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

function CartSummary({ setShowBill }) {
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white w-[380px] h-[450px] overflow-y-auto rounded-xl shadow-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Cart Summary</h2>

          <button
            onClick={() => setShowBill(false)}
            className="text-2xl font-bold text-gray-500 hover:text-red-500"
          >
            ✖
          </button>
        </div>
        {cart.length === 0 ? (
          <p className="text-center text-gray-500 py-6">Your cart is empty.</p>
        ) : (
          <>
            {/* Products Table */}
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Product</th>
                  <th className="text-center py-2">Qty</th>
                  <th className="text-right py-2">Price</th>
                </tr>
              </thead>

              <tbody>
                {cart.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2">{item.title}</td>

                    <td className="text-center">{item.quantity}</td>

                    <td className="text-right">
                      ₹{item.price * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Bill Details */}
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

            {/* Buttons */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => dispatch(clearCart())}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Clear Cart
              </button>
              <button
                onClick={() => navigate("/payment")}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
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
