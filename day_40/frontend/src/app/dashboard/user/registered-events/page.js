"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoutes";
import { getMyRegisteredEvents } from "@/service/registration.service";

function RegisteredEventsContent() {
  const router = useRouter();
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const response = await getMyRegisteredEvents();
      setEvents(response.data || []);
    } catch (error) {
      console.error("Failed to fetch registered events:", error);
    } finally {
      setLoading(false);
    }
  }

  function getEventStatus(date) {
    const eventDate = new Date(date);
    const today = new Date();

    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const difference = (eventDate - today) / (1000 * 60 * 60 * 24);

    if (difference < 0) {
      return "COMPLETED";
    }

    if (difference === 0) {
      return "TODAY";
    }

    if (difference === 1) {
      return "TOMORROW";
    }

    return "UPCOMING";
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => router.back()}
          className="mb-8 rounded-lg bg-slate-800 px-4 py-2 hover:bg-slate-700"
        >
          ← Back
        </button>

        <div className="mb-8">
          <p className="text-sm text-blue-500">MY EVENTS</p>

          <h1 className="mt-2 text-3xl font-bold">My Registered Events</h1>

          <p className="mt-2 text-slate-400">
            All events you have registered for.
          </p>
        </div>

        {loading ? (
          <p className="text-slate-400">Loading events...</p>
        ) : events.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
            <h2 className="text-xl font-semibold">No registered events</h2>

            <p className="mt-2 text-slate-400">
              You haven't registered for any events yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event._id}
                className="rounded-xl border border-slate-800 bg-slate-900 p-6"
              >
                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                  {getEventStatus(event.date)}
                </span>

                <h3 className="mt-8 text-xl font-semibold">{event.title}</h3>

                {event.description && (
                  <p className="mt-2 text-sm text-slate-400">
                    {event.description}
                  </p>
                )}

                {event.date && (
                  <p className="mt-6 text-sm text-slate-300">
                    Date: {new Date(event.date).toLocaleDateString()}
                  </p>
                )}

                {event.location && (
                  <p className="mt-2 text-sm text-slate-300">
                    Location: {event.location}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function RegisteredEventsPage() {
  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <RegisteredEventsContent />
    </ProtectedRoute>
  );
}
