import api from "./api";

export const getCars = async (params = {}) => {
  const response = await api.get("/cars", {
    params,
  });

  return response.data;
};

export const getAvailableCars = async () => {
  const response = await api.get("/cars/available");

  return response.data;
};

export const getCarById = async (id) => {
  const response = await api.get(`/cars/${id}`);

  return response.data;
};
