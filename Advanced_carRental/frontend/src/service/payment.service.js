import api from "./api";

export const getMyPayments = async () => {
  const response = await api.get("/payments/my");

  return response.data;
};

export const createPayment = async (paymentData) => {
  const response = await api.post("/payments", paymentData);

  return response.data;
};

export const getPaymentById = async (id) => {
  const response = await api.get(`/payments/${id}`);

  return response.data;
};
