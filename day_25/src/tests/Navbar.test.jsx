import { screen, render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Provider } from "react-redux";
import { store } from "../redux/store";
import Navbar from "../components/Navbar";

test("renders REDUX CART text", () => {
  render(
    <Provider store={store}>
      <Navbar
        showBill={false}
        setShowBill={() => {}}
        showCart={false}
        setShowCart={() => {}}
      />
    </Provider>,
  );
  expect(screen.getByText("Redux Cart")).toBeInTheDocument();
});
