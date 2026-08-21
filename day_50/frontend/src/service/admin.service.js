import { apiRequest } from "../components/utils/api";

// =========================
// USERS
// =========================

export const getAdminUsers = async () => {
  return await apiRequest("/admin/users");
};

export const addAdminUser = async (userData) => {
  return await apiRequest("/admin/users", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const updateUserRole = async (userId, role) => {
  return await apiRequest(`/admin/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
};

export const deleteAdminUser = async (userId) => {
  return await apiRequest(`/admin/users/${userId}`, {
    method: "DELETE",
  });
};

// =========================
// ORDERS
// =========================

export const getAdminOrders = async () => {
  return await apiRequest("/admin/orders");
};

export const getAdminOrderById = async (orderId) => {
  return await apiRequest(`/admin/orders/${orderId}`);
};

export const updateOrderStatus = async (orderId, status) => {
  return await apiRequest(`/admin/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};