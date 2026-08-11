"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoutes";
import { getAllEvents } from "@/service/event.service";

function OrganizerEventsContent() {
  const router = useRouter();
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  async function fetchEvents() {
    try {
      setLoading(true);
      setError("");

      const response = await getAllEvents();

      const allEvents = response.event || response.data || [];

      // Show only events created by this organizer
      const organizerEvents = allEvents.filter(
        (event) => event.organizer?._id?.toString() === user?.id?.toString(),
      );

      setEvents(organizerEvents);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setError(error.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(eventId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?",
    );

    if (!confirmed) return;

    try {
      // We'll connect your delete service here
      console.log("Delete event:", eventId);
    } catch (error) {
      setError(error.message || "Failed to delete event");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="mb-5 rounded-lg bg-slate-800 px-4 py-2 hover:bg-slate-700"
            >
              ← Back
            </button>

            <p className="text-sm text-blue-500">ORGANIZER</p>

            <h1 className="mt-2 text-3xl font-bold">My Events</h1>

            <p className="mt-2 text-slate-400">
              Manage the events you have created.
            </p>
          </div>

          <button
            onClick={() => router.push("/organizer/events/create")}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700"
          >
            + Create Event
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-8 rounded-lg border border-red-800 bg-red-950/40 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            Loading events...
          </div>
        ) : events.length === 0 ? (
          /* No Events */
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h2 className="text-xl font-semibold">No events created yet</h2>

            <p className="mt-2 text-slate-400">
              Create your first event to get started.
            </p>

            <button
              onClick={() => router.push("/organizer/events/create")}
              className="mt-6 rounded-lg bg-blue-600 px-5 py-3 hover:bg-blue-700"
            >
              Create Event
            </button>
          </div>
        ) : (
          /* Events */
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event._id}
                className="flex flex-col rounded-xl border border-slate-800 bg-slate-900 p-6"
              >
                {/* Status */}
                <span className="w-fit rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                  {event.status?.toUpperCase() || "UPCOMING"}
                </span>

                {/* Title */}
                <h2 className="mt-5 text-xl font-semibold">{event.title}</h2>

                {/* Description */}
                {event.description && (
                  <p className="mt-2 line-clamp-3 text-sm text-slate-400">
                    {event.description}
                  </p>
                )}

                {/* Date */}
                {event.date && (
                  <p className="mt-5 text-sm text-slate-300">
                    Date: {new Date(event.date).toLocaleDateString()}
                  </p>
                )}

                {/* Location */}
                {event.location && (
                  <p className="mt-2 text-sm text-slate-300">
                    Location: {event.location}
                  </p>
                )}

                {/* Capacity */}
                {event.capacity && (
                  <p className="mt-2 text-sm text-slate-400">
                    Capacity: {event.capacity}
                  </p>
                )}

                {/* Attendees */}
                <p className="mt-2 text-sm text-slate-400">
                  Registrations: {event.attendees?.length || 0}
                </p>

                {/* Buttons */}
                <div className="mt-auto flex gap-3 pt-6">
                  <button
                    onClick={() =>
                      router.push(`/organizer/events/${event._id}`)
                    }
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-700"
                  >
                    View
                  </button>

                  <button
                    onClick={() =>
                      router.push(`/organizer/events/${event._id}/edit`)
                    }
                    className="flex-1 rounded-lg bg-slate-700 px-4 py-2 hover:bg-slate-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(event._id)}
                    className="rounded-lg bg-red-600 px-4 py-2 hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function OrganizerEventsPage() {
  return (
    <ProtectedRoute allowedRoles={["organizer"]}>
      <OrganizerEventsContent />
    </ProtectedRoute>
  );
}
