import { apiRequest } from "@/components/utils/api";

export async function registerForEvent(eventId) {
  return apiRequest(`/event/${eventId}/register`, {
    method: "POST",
  });
}

export async function unregisterFromEvent(eventId) {
  return apiRequest(`/event/${eventId}/register`, {
    method: "DELETE",
  });
}

export async function getMyRegisteredEvents() {
  return apiRequest("/users/me/events", {
    method: "GET",
  });
}

export async function getEventAttendees(eventId) {
  return apiRequest(`/event/${eventId}/attendees`, {
    method: "GET",
  });
}

export async function removeAttendee(eventId, userId) {
  return apiRequest(`/registration/event/${eventId}/attendees/${userId}`, {
    method: "DELETE",
  });
}
