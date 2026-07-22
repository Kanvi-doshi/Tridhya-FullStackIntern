import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../redux/cartSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Payment() {
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const [paymentData, setPaymentData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "UPI",
  });

  const handleChange = (e) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    toast.success("Payment Successful!", {
      position: "top-right",
      autoClose: 2000,
    });

    console.log({
      customer: paymentData,
      orderAmount: totalAmount,
      items: cart,
    });

    dispatch(clearCart());
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-[400px]">
        <h2 className="text-2xl font-bold text-center mb-6">Payment Details</h2>

        <p className="text-lg font-semibold mb-4">
          Total Amount: ₹{totalAmount}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={paymentData.name}
            onChange={handleChange}
            className="border p-3 rounded"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={paymentData.email}
            onChange={handleChange}
            className="border p-3 rounded"
            required
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={paymentData.phone}
            onChange={handleChange}
            className="border p-3 rounded"
            required
          />

          <textarea
            name="address"
            placeholder="Delivery Address"
            value={paymentData.address}
            onChange={handleChange}
            className="border p-3 rounded"
            required
          />

          <select
            name="paymentMethod"
            value={paymentData.paymentMethod}
            onChange={handleChange}
            className="border p-3 rounded"
          >
            <option value="UPI">UPI</option>

            <option value="Card">Credit/Debit Card</option>

            <option value="COD">Cash On Delivery</option>
          </select>

          <button
            type="submit"
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
          >
            Pay ₹{totalAmount}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Payment;
