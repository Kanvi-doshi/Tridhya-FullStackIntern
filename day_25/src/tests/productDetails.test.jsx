
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { store } from "../redux/store";
import ProductDetails from "../pages/productDetails";

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
  },
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "100" }),
}));
test("renders Product not found", () => {
  render(
    <Provider store={store}>
      <MemoryRouter>
        <ProductDetails />
      </MemoryRouter>
    </Provider>,
  );

  expect(screen.getByText(/product not found/i)).toBeInTheDocument();
});
