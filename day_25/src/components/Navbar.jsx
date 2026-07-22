import { useSelector } from "react-redux";
import { FaShoppingCart } from "react-icons/fa";
import { FaShoppingBag } from "react-icons/fa";

function Navbar({ showBill, setShowBill, showCart, setShowCart }) {
  const cart = useSelector((state) => state.cart);

  return (
    <nav className="bg-blue-600 text-white px-8 py-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <FaShoppingBag className="text-2xl" />
          Redux Cart
        </h1>
        <div className="flex gap-4">
         
          <button
            onClick={() => setShowCart(!showCart)}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold shadow"
          >
            <FaShoppingCart />
            Cart ({cart.length})
          </button>

          <button
            onClick={() => setShowBill(!showBill)}
            className="bg-white rounded-xl px-5 py-3 shadow-md text-blue-600 font-semibold text-lg hover:shadow-lg transition"
          >
            View Bill
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
