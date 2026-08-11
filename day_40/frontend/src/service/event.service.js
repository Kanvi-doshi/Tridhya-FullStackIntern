import { apiRequest } from "@/components/utils/api";

export async function getAllEvents(params = {}) {
  const query = new URLSearchParams();

  if (params.search) {
    query.append("search", params.search);
  }

  if (params.category) {
    query.append("category", params.category);
  }

  if (params.location) {
    query.append("location", params.location);
  }

  if (params.sort) {
    query.append("sort", params.sort);
  }

  if (params.page) {
    query.append("page", params.page);
  }

  if (params.limit) {
    query.append("limit", params.limit);
  }

  const queryString = query.toString();

  return apiRequest(`/event${queryString ? `?${queryString}` : ""}`, {
    method: "GET",
  });
}

export async function getEventById(id) {
  return apiRequest(`/event/${id}`, {
    method: "GET",
  });
}

export async function createEvent(eventData) {
  return apiRequest("/event", {
    method: "POST",
    body: JSON.stringify(eventData),
  });
}

export async function updateEvent(id, eventData) {
  return apiRequest(`/event/${id}`, {
    method: "PUT",
    body: JSON.stringify(eventData),
  });
}

// Delete event
export async function deleteEvent(id) {
  return apiRequest(`/event/${id}`, {
    method: "DELETE",
  });
}
