import Cart from "../components/Cart";
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
        title: "iPhone 15 Pro",
        price: 129999,
        quantity: 1,
      },
    ],
  },
});

test("renders cart item", () => {
  render(
    <Provider store={mockStore}>
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    </Provider>
  );

  expect(
    screen.getByText(/iphone 15 pro/i)
  ).toBeInTheDocument();
});

test("renders quantity buttons", () => {
  render(
    <Provider store={mockStore}>
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    </Provider>
  );

  expect(screen.getByText("+")).toBeInTheDocument();
  expect(screen.getByText("-")).toBeInTheDocument();
});

test("renders remove button", () => {
  render(
    <Provider store={mockStore}>
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    </Provider>
  );

  expect(
    screen.getByText(/remove/i)
  ).toBeInTheDocument();
});

test("renders item quantity", () => {
  render(
    <Provider store={mockStore}>
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    </Provider>
  );

  expect(screen.getByText("1")).toBeInTheDocument();
});