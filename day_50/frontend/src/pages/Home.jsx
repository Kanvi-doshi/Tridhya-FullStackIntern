import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import Cart from "../components/cart";
import Navbar from "../components/Navbar";
import ProductList from "../components/ProductList";
import { setCartItems } from "../redux/cartSlice";
import CartSummary from "../components/cartSummary";
import { fetchUserCart } from "../service/cart.service";

function Home() {
  const [showBill, setShowBill] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const loadCart = async () => {
      try {
        const response = await fetchUserCart();
        console.log("Cart response:", response);
        dispatch(setCartItems(response.cart.items));
      } catch (error) {
        console.error("Failed to load cart:", error);
      }
    };

    loadCart();
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar
        showBill={showBill}
        setShowBill={setShowBill}
        showCart={showCart}
        setShowCart={setShowCart}
      />

      {showBill && <CartSummary setShowBill={setShowBill} />}

      {showCart && <Cart setShowCart={setShowCart} />}

      <main className="max-w-7xl mx-auto p-6">
        <ProductList />
      </main>
    </div>
  );
}

export default Home;
