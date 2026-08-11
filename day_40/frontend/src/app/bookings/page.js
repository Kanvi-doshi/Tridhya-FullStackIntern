"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import {
  getMyRegisteredEvents,
  unregisterFromEvent,
} from "@/service/registration.service";
import { useToast } from "@/components/toast/toastContext";

export default function MyBookingsPage() {
  const router = useRouter();

  const { user, loading } = useAuth();
  const { showToast } = useToast();

  const [events, setEvents] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    fetchBookings();
  }, [user, loading, router]);

  async function fetchBookings() {
    try {
      setPageLoading(true);
      setError("");

      const response = await getMyRegisteredEvents();

      setEvents(response.data || []);
    } catch (error) {
      setError(error.message || "Failed to load your bookings");
    } finally {
      setPageLoading(false);
    }
  }

  async function handleCancel(eventId) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this registration?",
    );

    if (!confirmed) return;

    try {
      await unregisterFromEvent(eventId);

      setEvents((currentEvents) =>
        currentEvents.filter((event) => event._id !== eventId),
      );
      showToast("Registration cancelled successfully", "success");
    } catch (error) {
      setError(error.message || "Failed to cancel registration");
      showToast(error.message || "Failed to cancel registration", "error");
    }
  }

  if (loading || pageLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading bookings...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="px-20 mx-auto max-w-7xl">
        <button
          onClick={() => router.back()}
          className="rounded-lg bg-slate-700 px-4 py-2 hover:bg-slate-600"
        >
          ← Back
        </button>
        <div className="mt-8 mb-6">
          <h1 className="text-3xl font-bold">My Bookings</h1>

          <p className="mt-2 text-slate-400">Events you have registered for</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-800 bg-red-950/40 p-6 text-red-400">
            {error}
          </div>
        )}

        {events.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h2 className="text-xl font-semibold">No bookings yet</h2>

            <p className="mt-2 text-slate-400">
              You haven't registered for any events.
            </p>

            <button
              onClick={() => router.push("/events")}
              className="mt-6 rounded-lg bg-blue-600 px-5 py-3 hover:bg-blue-700"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-2">
            {events.map((event) => (
              <div
                key={event._id}
                className="rounded-xl border border-slate-800 bg-slate-900 p-6"
              >
                <h2 className="text-xl font-semibold">{event.title}</h2>

                {event.description && (
                  <p className="mb-1 text-sm text-slate-400">
                    {event.description}
                  </p>
                )}

                {event.date && (
                  <p className="mt-10 text-sm text-slate-300">
                    Date: {new Date(event.date).toLocaleDateString()}
                  </p>
                )}

                {event.location && (
                  <p className="mb-1 text-sm text-slate-300">
                    Location: {event.location}
                  </p>
                )}

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => router.push(`/events/${event._id}`)}
                    className="rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-700"
                  >
                    View Event
                  </button>

                  <button
                    onClick={() => handleCancel(event._id)}
                    className="rounded-lg bg-red-600 px-4 py-2 hover:bg-red-700"
                  >
                    Cancel
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
