import { useState } from "react";
import Cart from "../components/cart"
import Navbar from "../components/Navbar";
import ProductList from "../components/ProductList";
import CartSummary from "../components/cartSummary";
import Payment from "./Payment";

function Home() {
  const [showBill, setShowBill] = useState(false);
  const [showCart, setShowCart] = useState(false);

  return (
    <div className="min-h-screen bg-white-100">
      <Navbar
        showBill={showBill}
        setShowBill={setShowBill}
        showCart={showCart}
        setShowCart={setShowCart}
      />
      {showBill && <CartSummary setShowBill={setShowBill} />}
      {showCart && <Cart setShowCart={setShowCart} />}
      <div className="max-w-9xl mx-auto p-6">
        <div className=" gap-6">
          <ProductList />
        </div>
      </div>
    </div>
  );
}

export default Home;
