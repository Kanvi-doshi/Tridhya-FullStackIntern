import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";

import { increaseQty, decreaseQty, removeFromCart } from "../redux/cartSlice";

function Cart({ setShowCart }) {
  const cart = useSelector((state) => state.cart);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const dispatch = useDispatch();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl w-[500px] max-h-[80vh] overflow-y-auto relative">
        <button
          onClick={() => setShowCart(false)}
          className="absolute top-3 right-4 text-2xl font-bold"
        >
          ✖
        </button>
        <h2 className="text-2xl font-bold mb-6">
          Shopping Cart ({totalItems}){" "}
        </h2>

        {cart.length === 0 ? (
          <p className="text-gray-500">Cart is empty</p>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="border rounded-xl p-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>

                    <p className="text-gray-500">₹{item.price}</p>
                  </div>

                  <button
                    onClick={() => {
                      (dispatch(removeFromCart(item.id)),
                        toast.error(`${item.title} removed from cart!`, {
                          position: "top-right",
                          autoClose: 2000,
                        }));
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Remove
                  </button>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() => dispatch(decreaseQty(item.id))}
                    className="bg-gray-200 px-3 py-1 rounded"
                  >
                    -
                  </button>

                  <span className="font-semibold">{item.quantity}</span>

                  <button
                    onClick={() => dispatch(increaseQty(item.id))}
                    className="bg-gray-200 px-3 py-1 rounded"
                  >
                    +
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
