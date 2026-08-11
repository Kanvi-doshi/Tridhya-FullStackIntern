"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useAuth } from "@/components/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoutes";
import { getEventById, deleteEventService } from "@/service/event.service";
import { useToast } from "@/components/context/ToastContext";

function OrganizerEventDetailsContent() {
  const params = useParams();
  const router = useRouter();

  const { user } = useAuth();
  const { showToast } = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

  async function fetchEvent() {
    try {
      setLoading(true);
      setError("");

      const response = await getEventById(params.id);

      setEvent(response.data);
    } catch (error) {
      console.error("Failed to fetch event:", error);

      setError(error.message || "Failed to load event");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?",
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      await deleteEventService(event._id);

      showToast("Event deleted successfully", "success");

      router.push("/organizer/events");
    } catch (error) {
      console.error("Failed to delete event:", error);

      setError(error.message || "Failed to delete event");

      showToast(error.message || "Failed to delete event", "error");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-slate-400">Loading event...</p>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() => router.back()}
            className="mb-6 rounded-lg bg-slate-800 px-4 py-2 hover:bg-slate-700"
          >
            ← Back
          </button>

          <div className="rounded-xl border border-red-800 bg-red-950/40 p-6 text-center text-red-400">
            {error || "Event not found"}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-5xl">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="mb-6 rounded-lg bg-slate-800 px-4 py-2 hover:bg-slate-700"
        >
          ← Back
        </button>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-800 bg-red-950/40 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Event Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                {event.status?.toUpperCase() || "UPCOMING"}
              </span>

              <h1 className="mt-5 text-4xl font-bold">{event.title}</h1>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  router.push(`/organizer/events/${event._id}/edit`)
                }
                className="rounded-lg bg-slate-700 px-5 py-2 hover:bg-slate-600"
              >
                Edit
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-5 py-2 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold">Description</h2>

              <p className="mt-2 leading-7 text-slate-400">
                {event.description}
              </p>
            </div>
          )}

          {/* Event Information */}
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {/* Date */}
            {event.date && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-sm text-slate-500">Date</p>

                <p className="mt-2 text-lg font-medium">
                  {new Date(event.date).toLocaleDateString()}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {new Date(event.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}

            {/* Location */}
            {event.location && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-sm text-slate-500">Location</p>

                <p className="mt-2 text-lg font-medium">{event.location}</p>
              </div>
            )}

            {/* Category */}
            {event.category && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-sm text-slate-500">Category</p>

                <p className="mt-2 text-lg font-medium">{event.category}</p>
              </div>
            )}

            {/* Capacity */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-sm text-slate-500">Capacity</p>

              <p className="mt-2 text-lg font-medium">{event.capacity}</p>
            </div>
          </div>

          {/* Registration Summary */}
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950 p-6">
            <p className="text-sm text-slate-500">Registrations</p>

            <div className="mt-3 flex items-end gap-2">
              <span className="text-3xl font-bold">
                {event.attendees?.length || 0}
              </span>

              <span className="mb-1 text-slate-400">/ {event.capacity}</span>
            </div>

            {/* Progress */}
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-blue-600"
                style={{
                  width: `${Math.min(
                    ((event.attendees?.length || 0) / event.capacity) * 100,
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Attendees */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Registered Attendees</h2>

              <span className="text-sm text-slate-400">
                {event.attendees?.length || 0} registered
              </span>
            </div>

            {event.attendees?.length === 0 ? (
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-6 text-center text-slate-400">
                No one has registered for this event yet.
              </div>
            ) : (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
                {event.attendees.map((attendee) => (
                  <div
                    key={attendee._id}
                    className="flex items-center justify-between border-b border-slate-800 bg-slate-950 p-5 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium">{attendee.name}</p>

                      <p className="mt-1 text-sm text-slate-400">
                        {attendee.email}
                      </p>
                    </div>

                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                      Registered
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function OrganizerEventDetailsPage() {
  return (
    <ProtectedRoute allowedRoles={["organizer"]}>
      <OrganizerEventDetailsContent />
    </ProtectedRoute>
  );
}
