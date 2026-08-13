"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoutes";
import { useAuth } from "@/components/context/AuthContext";
import { apiRequest } from "@/components/utils/api.js";

function AdminEventsPageContent() {
  const router = useRouter();
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, search, statusFilter]);

  async function fetchEvents() {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest("/admin/events");

      const eventData = response.data || [];

      setEvents(eventData);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setError(error.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  function getEventStatus(date) {
    if (!date) return "UNKNOWN";

    const eventDate = new Date(date);
    const today = new Date();

    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) {
      return "COMPLETED";
    }

    if (eventDate.getTime() === today.getTime()) {
      return "TODAY";
    }

    return "UPCOMING";
  }

  function filterEvents() {
    let result = [...events];

    if (search.trim()) {
      const searchValue = search.toLowerCase();

      result = result.filter((event) => {
        const title = event.title?.toLowerCase() || "";
        const location = event.location?.toLowerCase() || "";
        const organizerName = event.organizer?.name?.toLowerCase() || "";
        const organizerEmail = event.organizer?.email?.toLowerCase() || "";

        return (
          title.includes(searchValue) ||
          location.includes(searchValue) ||
          organizerName.includes(searchValue) ||
          organizerEmail.includes(searchValue)
        );
      });
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (event) =>
          getEventStatus(event.date).toLowerCase() ===
          statusFilter.toLowerCase(),
      );
    }

    setFilteredEvents(result);
  }

  async function handleDelete(eventId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?",
    );

    if (!confirmed) return;

    try {
      await apiRequest(`/admin/events/${eventId}`, {
        method: "DELETE",
      });

      setEvents((currentEvents) =>
        currentEvents.filter((event) => event._id !== eventId),
      );
    } catch (error) {
      console.error("Failed to delete event:", error);

      setError(error.message || "Failed to delete event");
    }
  }

  function getStatusStyle(status) {
    if (status === "UPCOMING") {
      return "bg-blue-500/10 text-blue-400";
    }

    if (status === "TODAY") {
      return "bg-green-500/10 text-green-400";
    }

    if (status === "COMPLETED") {
      return "bg-slate-500/10 text-slate-400";
    }

    return "bg-slate-500/10 text-slate-400";
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-500">ADMIN DASHBOARD</p>

            <h1 className="mt-2 text-3xl font-bold">Manage Events</h1>

            <p className="mt-2 text-slate-400">
              View and manage all events on the platform.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard/admin")}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-800 bg-red-950/40 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mt-8 flex flex-col gap-4 md:flex-row">
          <input
            type="text"
            placeholder="Search events, location or organizer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming</option>
            <option value="today">Today</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Event Count */}
        <div className="mt-6">
          <p className="text-sm text-slate-400">
            Showing{" "}
            <span className="font-semibold text-white">
              {filteredEvents.length}
            </span>{" "}
            of <span className="font-semibold text-white">{events.length}</span>{" "}
            events
          </p>
        </div>

        {/* Events */}
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          {loading ? (
            <div className="p-10 text-center text-slate-400">
              Loading events...
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-10 text-center">
              <h2 className="text-lg font-semibold">No events found</h2>

              <p className="mt-2 text-sm text-slate-400">
                Try changing your search or filter.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {filteredEvents.map((event) => {
                const status = getEventStatus(event.date);

                return (
                  <div
                    key={event._id}
                    className="p-5 transition hover:bg-slate-800/40"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      {/* Event Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <h2 className="truncate text-lg font-semibold">
                            {event.title}
                          </h2>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                              status,
                            )}`}
                          >
                            {status}
                          </span>
                        </div>

                        {event.description && (
                          <p className="mt-2 line-clamp-1 text-sm text-slate-400">
                            {event.description}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
                          {event.date && (
                            <span>
                              Date:{" "}
                              <span className="text-slate-300">
                                {new Date(event.date).toLocaleDateString()}
                              </span>
                            </span>
                          )}

                          {event.location && (
                            <span>
                              Location:{" "}
                              <span className="text-slate-300">
                                {event.location}
                              </span>
                            </span>
                          )}

                          <span>
                            Organizer:{" "}
                            <span className="text-slate-300">
                              {event.organizer?.name ||
                                event.organizer?.email ||
                                "Unknown"}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="rounded-lg bg-red-600/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-600 hover:text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function AdminEventsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminEventsPageContent />
    </ProtectedRoute>
  );
}
