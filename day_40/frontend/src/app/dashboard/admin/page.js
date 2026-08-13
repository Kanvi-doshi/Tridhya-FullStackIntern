"use client";

import { useAuth } from "@/components/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoutes";
import { apiRequest } from "@/components/utils/api.js";
import { getMyProfile } from "@/service/profile.service";

function AdminDashboardContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    organizers: 0,
    admins: 0,
    events: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    fetchProfileImage();
    fetchAdminStats();
  }, []);

  async function fetchProfileImage() {
    try {
      const response = await getMyProfile();

      setProfileImage(response.data?.profileImage || "");
    } catch (error) {
      console.error("Failed to fetch profile image:", error);
    }
  }

  async function fetchAdminStats() {
    try {
      setLoadingStats(true);

      const usersResponse = await apiRequest("/admin/users");
      const eventsResponse = await apiRequest("/admin/events");

      const users = usersResponse.data || [];
      const events = eventsResponse.data || [];

      setStats({
        users: users.filter((user) => user.role === "user").length,
        organizers: users.filter((user) => user.role === "organizer").length,
        events: events.length,
      });
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
    } finally {
      setLoadingStats(false);
    }
  }
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-500">ADMIN DASHBOARD</p>

            <h1 className="mt-2 text-3xl font-bold">Welcome, {user?.name}</h1>

            <p className="mt-2 text-slate-400">
              Manage users, organizers, events and bookings.
            </p>
          </div>

          {/* Profile + Logout */}
          <div className="flex items-center gap-4">
            {/* Profile Avatar */}
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
                  {user?.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
              )}
            </button>

            {/* Logout */}
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

        {/* Overview Cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Users */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:border-blue-500">
            <p className="text-sm text-slate-400">Total Users</p>

            <h2 className="mt-2 text-3xl font-bold text-blue-500">
              {loadingStats ? "..." : stats.users}
            </h2>
            <p className="mt-2 text-sm text-slate-500">Registered users</p>

            <button
              onClick={() => router.push("/dashboard/admin/users")}
              className="mt-5 text-sm font-medium text-blue-500 hover:text-blue-400"
            >
              Manage Users →
            </button>
          </div>

          {/* Organizers */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:border-blue-500">
            <p className="text-sm text-slate-400">Total Organizers</p>

            <h2 className="mt-3 text-3xl font-bold">
              {loadingStats ? "..." : stats.organizers}
            </h2>

            <p className="mt-2 text-sm text-slate-500">Registered organizers</p>

            <button
              onClick={() => router.push("/dashboard/admin/organizers")}
              className="mt-5 text-sm font-medium text-blue-500 hover:text-blue-400"
            >
              Manage Organizers →
            </button>
          </div>

          {/* Events */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:border-blue-500">
            <p className="text-sm text-slate-400">Total Events</p>

            <h2 className="mt-3 text-3xl font-bold">
              {loadingStats ? "..." : stats.events}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Events on the platform
            </p>

            <button
              onClick={() => router.push("/dashboard/admin/events")}
              className="mt-5 text-sm font-medium text-blue-500 hover:text-blue-400"
            >
              Manage Events →
            </button>
          </div>

          {/* Bookings */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:border-blue-500">
            <p className="text-sm text-slate-400">Total Bookings</p>

            <h2 className="mt-3 text-3xl font-bold">
              {loadingStats ? "..." : stats.bookings}
            </h2>

            <p className="mt-2 text-sm text-slate-500">Event registrations</p>

            <button
              onClick={() => router.push("/dashboard/admin/bookings")}
              className="mt-5 text-sm font-medium text-blue-500 hover:text-blue-400"
            >
              View Bookings →
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-10">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Recent Activity</h2>

                <p className="mt-1 text-sm text-slate-400">
                  Recent activity across the platform.
                </p>
              </div>

              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                Admin
              </span>
            </div>

            <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-6 text-center">
              <p className="text-slate-500">No recent activity to display.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
