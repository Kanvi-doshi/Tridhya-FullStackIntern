"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoutes";

import { getMyEvents } from "@/service/event.service";
import {
  getEventAttendees,
  removeAttendee,
} from "@/service/registration.service";

function OrganizerBookingsContent() {
  const router = useRouter();

  const [events, setEvents] = useState([]);
  const [attendees, setAttendees] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      setLoading(true);
      setError("");

      // Get only events created by the logged-in organizer
      const response = await getMyEvents();
      const myEvents = response.event || [];

      setEvents(myEvents);

      // Get attendees for each event
      await Promise.all(
        myEvents.map(async (event) => {
          try {
            const response = await getEventAttendees(event._id);

            setAttendees((current) => ({
              ...current,
              [event._id]: response.data || [],
            }));
          } catch (error) {
            console.error(
              `Failed to fetch attendees for ${event.title}:`,
              error,
            );

            setAttendees((current) => ({
              ...current,
              [event._id]: [],
            }));
          }
        }),
      );
    } catch (error) {
      console.error("Failed to fetch bookings:", error);

      setError(error.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(eventId, userId) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this user from the event?",
    );

    if (!confirmed) return;

    try {
      setRemoving(`${eventId}-${userId}`);
      setError("");

      await removeAttendee(eventId, userId);

      // Remove user from UI immediately
      setAttendees((current) => ({
        ...current,
        [eventId]: (current[eventId] || []).filter(
          (attendee) => attendee._id !== userId,
        ),
      }));
    } catch (error) {
      console.error("Failed to remove attendee:", error);

      setError(error.message || "Failed to remove registered user");
    } finally {
      setRemoving(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Back Button */}
        <button
          onClick={() => router.push("/dashboard/organizer")}
          className="mb-6 rounded-lg bg-slate-800 px-4 py-2 hover:bg-slate-700"
        >
          ← Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-blue-500">ORGANIZER</p>

          <h1 className="mt-2 text-3xl font-bold">Manage Bookings</h1>

          <p className="mt-2 text-slate-400">
            View and manage users registered for your events.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-800 bg-red-950/40 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            Loading bookings...
          </div>
        ) : events.length === 0 ? (
          /* No Events */
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h2 className="text-xl font-semibold">No events yet</h2>

            <p className="mt-2 text-slate-400">
              You haven't created any events yet.
            </p>

            <button
              onClick={() => router.push("/events/create")}
              className="mt-6 rounded-lg bg-blue-600 px-5 py-3 hover:bg-blue-700"
            >
              Create Event
            </button>
          </div>
        ) : (
          /* Events Grid */
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {events.map((event) => {
              const eventAttendees = attendees[event._id] || [];

              return (
                <div
                  key={event._id}
                  className="flex flex-col rounded-xl border border-slate-800 bg-slate-900 p-6"
                >
                  {/* Event Status */}
                  <span className="w-fit rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                    {event.status?.toUpperCase() || "UPCOMING"}
                  </span>

                  {/* Event Title */}
                  <h2 className="mt-4 text-2xl font-bold">{event.title}</h2>

                  {/* Event Information */}
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
                    {event.date && (
                      <span>
                        Date: {new Date(event.date).toLocaleDateString()}
                      </span>
                    )}

                    {event.time && <span>Time: {event.time}</span>}

                    {event.capacity && <span>Capacity: {event.capacity}</span>}

                    <span>Registered: {eventAttendees.length}</span>
                  </div>

                  {/* Registered Users */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold">Registered Users</h3>

                    {eventAttendees.length === 0 ? (
                      <div className="mt-4 rounded-lg bg-slate-950 p-5">
                        <p className="text-slate-400">
                          No users have registered for this event yet.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-3">
                        {eventAttendees.map((attendee) => {
                          const removeId = `${event._id}-${attendee._id}`;

                          return (
                            <div
                              key={attendee._id}
                              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4"
                            >
                              {/* User Information */}
                              <div>
                                <p className="font-medium text-white">
                                  {attendee.name}
                                </p>

                                <p className="mt-1 text-sm text-slate-400">
                                  {attendee.email}
                                </p>
                              </div>

                              {/* Remove User */}
                              <button
                                onClick={() =>
                                  handleRemove(event._id, attendee._id)
                                }
                                disabled={removing === removeId}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {removing === removeId
                                  ? "Removing..."
                                  : "Remove"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default function OrganizerBookingsPage() {
  return (
    <ProtectedRoute allowedRoles={["organizer"]}>
      <OrganizerBookingsContent />
    </ProtectedRoute>
  );
}
