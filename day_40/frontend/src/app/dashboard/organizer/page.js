"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoutes";

function OrganizerDashboardContent() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-500">ORGANIZER DASHBOARD</p>

            <h1 className="mt-2 text-3xl font-bold">Welcome, {user?.name}</h1>

            <p className="mt-2 text-slate-400">
              Manage your events and registrations from here.
            </p>
          </div>

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

        {/* Dashboard Cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {/* Create Event */}
          <button
            onClick={() => router.push("/organizer/events/create")}
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
            onClick={() => router.push("/organizer/events")}
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
            onClick={() => router.push("/organizer/bookings")}
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
