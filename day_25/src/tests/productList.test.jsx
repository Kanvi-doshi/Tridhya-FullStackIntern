import ProductList from "../components/ProductList";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";

const mockStore = configureStore({
  reducer: {
    cart: () => [],
    products: () => ({
      items: [],
      loading: false,
      error: null,
    }),
  },
});

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve([]),
    }),
  );
});

test("renders Our Products heading", async () => {
  render(
    <Provider store={mockStore}>
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>
    </Provider>,
  );

  await waitFor(() => {
    expect(screen.getByText(/our products/i)).toBeInTheDocument();
  });
});

test("renders search input", () => {
  render(
    <Provider store={mockStore}>
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>
    </Provider>,
  );

  expect(screen.getByPlaceholderText(/search products/i)).toBeInTheDocument();
});

test("renders category dropdown", () => {
  render(
    <Provider store={mockStore}>
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>
    </Provider>,
  );

  expect(screen.getByRole("combobox")).toBeInTheDocument();
});

afterEach(() => {
  jest.restoreAllMocks();
});
