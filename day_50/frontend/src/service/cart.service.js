import {apiRequest} from "../components/utils/api";

// Get logged-in user's cart
export const fetchUserCart = async () => {
  const token = localStorage.getItem("token");
  return await apiRequest("/cart/all", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

// Add product to backend cart
export const createCartItem = async (productId, quantity = 1) => {
  const token = localStorage.getItem("token");
  return await apiRequest("/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      productId,
      quantity,
    }),
  });
};

// Change quantity in backend cart
export const changeCartItemQuantity = async (productId, quantity) => {
  const token = localStorage.getItem("token");
  return await apiRequest("/cart", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      productId,
      quantity,
    }),
  });
};

// Remove item from backend cart
export const deleteCartItem = async (productId) => {
  const token = localStorage.getItem("token");

  return await apiRequest("/cart", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      productId,
    }),
  });
};

// Clear backend cart
export const deleteEntireCart = async () => {
  const token = localStorage.getItem("token");
  return await apiRequest("/cart/clear", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createOrder = async (shippingAddress) => {
  const token = localStorage.getItem("token");

  return await apiRequest("/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      shippingAddress,
    }),
  });
};
