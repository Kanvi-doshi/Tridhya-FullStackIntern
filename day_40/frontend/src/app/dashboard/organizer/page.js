"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoutes";
import { getMyProfile } from "@/service/profile.service";

function OrganizerDashboardContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profileImage, setProfileImage] = useState("");

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
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-500">ORGANIZER DASHBOARD</p>

            <h1 className="mt-2 text-3xl font-bold">Welcome, {user?.name}</h1>

            <p className="mt-2 text-slate-400">
              Manage your events and registrations from here.
            </p>
          </div>
          <div className="flex items-center gap-3">
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
        {/* Promotional Banner */}
        <div className="mt-10 rounded-2xl border border-blue-500/40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-lg">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">
                EventHub for Organizers
              </p>

              <h2 className="mt-2 text-2xl font-bold md:text-3xl">
                Make Your Next Event Unforgettable
              </h2>

              <p className="mt-2 max-w-2xl text-sm text-blue-100 md:text-base">
                Create, manage, and grow your events with EventHub. Reach more
                attendees and keep everything organized in one place.
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {/* Create Event */}
          <button
            onClick={() => router.push("/events/create")}
            className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-left transition hover:border-blue-500 hover:bg-slate-800"
          >
            <h2 className="text-lg font-semibold">Create Event</h2>

            <p className="mt-2 text-sm text-slate-400">
              Create and publish a new event.
            </p>

            <p className="mt-5 text-sm font-medium text-blue-500">
              Create Event →
            </p>
          </button>

          {/* Manage Events */}
          <button
            onClick={() => router.push("/dashboard/organizer/events")}
            className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-left transition hover:border-blue-500 hover:bg-slate-800"
          >
            <h2 className="text-lg font-semibold">Manage Events</h2>

            <p className="mt-2 text-sm text-slate-400">
              View, edit, and manage the events you created.
            </p>

            <p className="mt-5 text-sm font-medium text-blue-500">
              Manage Events →
            </p>
          </button>

          {/* Manage Bookings */}
          <button
            onClick={() => router.push("/dashboard/organizer/bookings")}
            className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-left transition hover:border-blue-500 hover:bg-slate-800"
          >
            <h2 className="text-lg font-semibold">Manage Bookings</h2>

            <p className="mt-2 text-sm text-slate-400">
              View attendees registered for your events.
            </p>

            <p className="mt-5 text-sm font-medium text-blue-500">
              Manage Bookings →
            </p>
          </button>
        </div>
      </div>
    </main>
  );
}

export default function OrganizerDashboard() {
  return (
    <ProtectedRoute allowedRoles={["organizer"]}>
      <OrganizerDashboardContent />
    </ProtectedRoute>
  );
}
