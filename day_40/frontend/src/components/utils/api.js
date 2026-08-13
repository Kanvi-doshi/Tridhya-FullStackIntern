import { getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",

      ...(token && {
        Authorization: `Bearer ${token}`,
      }),

      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    let message = data.message || "Something went wrong";

    // Handle Zod validation errors
    if (data.errors) {
      const firstField = Object.keys(data.errors)[0];

      if (firstField && data.errors[firstField]?.length > 0) {
        message = data.errors[firstField][0];
      }
    }

    throw new Error(message);
  }

  return data;
}
