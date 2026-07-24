import CartSummary from "../components/cartSummary";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "../redux/cartSlice";

const mockStore = configureStore({
  reducer: {
    cart: cartReducer,
  },
  preloadedState: {
    cart: [
      {
        id: 1,
        title: "iPhone",
        price: 1000,
        quantity: 2,
      },
    ],
  },
});

  
const mockSetShowBill = jest.fn();

test("renders Cart Summary heading", () => {
  render(
    <Provider store={mockStore}>
      <MemoryRouter>
        <CartSummary setShowBill={mockSetShowBill} />
      </MemoryRouter>
    </Provider>
  );

  expect(
    screen.getByText(/cart summary/i)
  ).toBeInTheDocument();
});

test("renders total items", () => {
  render(
    <Provider store={mockStore}>
      <MemoryRouter>
        <CartSummary setShowBill={mockSetShowBill} />
      </MemoryRouter>
    </Provider>
  );

  expect(
    screen.getByText(/total items/i)
  ).toBeInTheDocument();
});

test("renders Clear Cart button", () => {
  render(
    <Provider store={mockStore}>
      <MemoryRouter>
        <CartSummary setShowBill={mockSetShowBill} />
      </MemoryRouter>
    </Provider>
  );

  expect(
    screen.getByRole("button", { name: /clear cart/i })
  ).toBeInTheDocument();
});

test("renders Pay Now button", () => {
  render(
    <Provider store={mockStore}>
      <MemoryRouter>
        <CartSummary setShowBill={mockSetShowBill} />
      </MemoryRouter>
    </Provider>
  );

  expect(
    screen.getByRole("button", { name: /pay now/i })
  ).toBeInTheDocument();
});