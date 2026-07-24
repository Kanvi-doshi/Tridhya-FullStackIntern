import Payment from "../pages/Payment";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

const renderPayment = () => {
  render(
    <Provider store={mockStore}>
      <MemoryRouter>
        <Payment />
      </MemoryRouter>
    </Provider>
  );
};

test("renders Payment Details heading", () => {
  renderPayment();

  expect(
    screen.getByText(/payment details/i)
  ).toBeInTheDocument();
});

test("renders total amount", () => {
  renderPayment();

  expect(
    screen.getByText(/total amount: ₹2000/i)
  ).toBeInTheDocument();
});

test("renders Full Name input", () => {
  renderPayment();

  expect(
    screen.getByPlaceholderText(/full name/i)
  ).toBeInTheDocument();
});

test("renders Email input", () => {
  renderPayment();

  expect(
    screen.getByPlaceholderText(/email/i)
  ).toBeInTheDocument();
});

test("renders Phone Number input", () => {
  renderPayment();

  expect(
    screen.getByPlaceholderText(/phone number/i)
  ).toBeInTheDocument();
});

test("renders Delivery Address input", () => {
  renderPayment();

  expect(
    screen.getByPlaceholderText(/delivery address/i)
  ).toBeInTheDocument();
});

test("renders payment method dropdown", () => {
  renderPayment();

  expect(
    screen.getByDisplayValue(/upi/i)
  ).toBeInTheDocument();
});

test("renders Pay button", () => {
  renderPayment();

  expect(
    screen.getByRole("button", {
      name: /pay/i,
    })
  ).toBeInTheDocument();
});

test("allows user to type in Full Name field", async () => {
  renderPayment();

  const input = screen.getByPlaceholderText(/full name/i);

  await userEvent.type(input, "Kanvi Doshi");

  expect(input).toHaveValue("Kanvi Doshi");
});

test("allows user to type in Email field", async () => {
  renderPayment();

  const input = screen.getByPlaceholderText(/email/i);

  await userEvent.type(input, "kanvi@example.com");

  expect(input).toHaveValue("kanvi@example.com");
});

test("allows user to type in Phone Number field", async () => {
  renderPayment();

  const input = screen.getByPlaceholderText(/phone number/i);

  await userEvent.type(input, "9876543210");

  expect(input).toHaveValue("9876543210");
});