import { apiRequest } from "@/components/utils/api";

export async function getMyProfile() {
  return apiRequest("/auth/profile", {
    method: "GET",
  });
}

export async function updateMyProfile(data) {
  return apiRequest("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteMyProfile() {
  return apiRequest("/auth/profile", {
    method: "DELETE",
  });
}
