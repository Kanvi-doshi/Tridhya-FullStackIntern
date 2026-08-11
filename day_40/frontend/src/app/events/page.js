"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoutes";
import { getAllEvents } from "@/service/event.service";

function EventsContent() {
  const router = useRouter();
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvents();
  }, [search, category, location, sort]);

  async function fetchEvents() {
    try {
      setLoading(true);
      setError("");
      const response = await getAllEvents({
        search,
        category,
        location,
        sort,
      });

      setEvents(response.event || []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setError(error.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white ">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => router.back()}
          className="mb-4 rounded-lg bg-slate-800 px-4 py-2 hover:bg-slate-700"
        >
          ← Back
        </button>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className=" mt-2 text-xl text-blue-500">EVENTS</p>

            <h1 className="mt-2 text-2xl font-bold">Browse Events</h1>

            <p className="mt-2 text-slate-400">
              Discover upcoming events and find something interesting.
            </p>
          </div>
        </div>
        {/* Event Filters */}
        <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events..."
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="">All Categories</option>
                <option value="Technology">Technology</option>
                <option value="Business">Business</option>
                <option value="Music">Music</option>
                <option value="Sports">Sports</option>
                <option value="Workshop">Workshop</option>
                <option value="Conference">Conference</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Location
              </label>

              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location..."
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            {/* Sort */}
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Sort By
              </label>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="">Newest</option>
                <option value="date">Date: Earliest</option>
                <option value="-date">Date: Latest</option>
                <option value="title">Title: A-Z</option>
                <option value="-title">Title: Z-A</option>
              </select>
            </div>
          </div>
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
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
            <h2 className="text-xl font-semibold">No events available</h2>

            <p className="mt-2 text-slate-400">
              There are currently no events to display.
            </p>
          </div>
        ) : (
          <div className="grid gap-20 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event._id}
                className="flex flex-col rounded-xl border border-slate-800 bg-slate-900 p-6"
              >
                <span className="w-fit rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                  {event.status?.toUpperCase() || "UPCOMING"}
                </span>

                <h2 className="mt-5 text-xl font-semibold">{event.title}</h2>

                {event.description && (
                  <p className="mt-2 line-clamp-3 text-sm text-slate-400">
                    {event.description}
                  </p>
                )}

                {event.date && (
                  <p className="mt-5 text-sm text-slate-300">
                    Date: {new Date(event.date).toLocaleDateString()}
                  </p>
                )}

                {event.location && (
                  <p className="mt-2 text-sm text-slate-300">
                    Location: {event.location}
                  </p>
                )}

                {event.capacity && (
                  <p className="mt-2 text-sm text-slate-400">
                    Capacity: {event.capacity}
                  </p>
                )}

                <div className="mt-auto pt-6">
                  <button
                    onClick={() => router.push(`/events/${event._id}`)}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-700"
                  >
                    View Details
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

export default function EventsPage() {
  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <EventsContent />
    </ProtectedRoute>
  );
}
