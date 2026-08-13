"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoutes";
import {
  getMyRegisteredEvents,
  unregisterFromEvent,
} from "@/service/registration.service";
import { getMyProfile } from "@/service/profile.service";

function UserDashboardContent() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    fetchMyEvents();
  }, []);

  useEffect(() => {
    fetchProfileImage();
  }, []);

  async function fetchProfileImage() {
    try {
      const response = await getMyProfile();

      setProfileImage(response.data?.profileImage || "");
    } catch (error) {
      console.error("Failed to fetch profile image:", error);
    }
  }
  async function fetchMyEvents() {
    try {
      setLoading(true);
      setError("");

      const response = await getMyRegisteredEvents();

      setEvents(response.data || []);
    } catch (error) {
      console.error("Failed to fetch registered events:", error);

      setError(error.message || "Failed to load your registered events");
    } finally {
      setLoading(false);
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
    } catch (error) {
      setError(error.message || "Failed to cancel registration");
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
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-500">USER DASHBOARD</p>

            <h1 className="mt-2 text-3xl font-bold">Welcome, {user?.name}</h1>

            <p className="mt-2 text-slate-400">
              Manage your events and bookings.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/profile")}
              className="group relative h-12 w-12 overflow-hidden rounded-full border-2 border-slate-700 transition hover:border-blue-500"
              title="My Profile"
            >
              {profileImage ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${profileImage}`}
                  alt="Profile"
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-800 text-lg font-semibold text-slate-300">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </button>
            <button
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="rounded-lg bg-red-600 px-5 py-2 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-800 bg-red-950/40 p-4 text-red-400">
            {error}
          </div>
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">Browse Events</h2>

            <p className="mt-2 text-slate-400">
              Discover upcoming events and register for them.
            </p>
            <div className="mt-auto pt-5">
              <button
                onClick={() => router.push("/events")}
                className="rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-700"
              >
                Browse Events
              </button>
            </div>
          </div>

          <div className=" flex flex-col rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">My Bookings</h2>

            <p className="mt-2 text-3xl font-bold text-blue-500">
              {loading ? "..." : events.length}
            </p>
            <p className="mt-1 text-slate-400">Registered events</p>

            <div className="mt-auto pt-5">
              <button
                onClick={() => router.push("/bookings")}
                className=" rounded-lg bg-slate-700 px-4 py-2 hover:bg-slate-600"
              >
                View Bookings
              </button>
            </div>
          </div>
        </div>
        <div className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">My Events</h2>
            </div>

            {events.length > 0 && (
              <button
                onClick={() => router.push("/dashboard/user/registered-events")}
                className="text-sm text-blue-500 hover:text-blue-400"
              >
                View All
              </button>
            )}
          </div>

          {loading ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
              Loading your events...
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
              <h3 className="text-lg font-semibold">No registered events</h3>

              <p className="mt-2 text-slate-400">
                You haven't registered for any events yet.
              </p>

              <button
                onClick={() => router.push("/events")}
                className="mt-5 rounded-lg bg-blue-600 px-5 py-2 hover:bg-blue-700"
              >
                Find Events
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.slice(0, 3).map((event) => (
                <div
                  key={event._id}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-6"
                >
                  <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                    {getEventStatus(event.date)}
                  </span>

                  <h3 className=" mt-8 text-xl font-semibold">{event.title}</h3>

                  {event.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                      {event.description}
                    </p>
                  )}

                  {event.date && (
                    <p className="mt-4 text-sm text-slate-300">
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
      </div>
    </main>
  );
}

export default function UserDashboard() {
  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <UserDashboardContent />
    </ProtectedRoute>
  );
}
