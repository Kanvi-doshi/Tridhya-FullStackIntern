"use client";

import { useAuth } from "@/components/context/AuthContext";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoutes";

function AdminDashboardContent() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-500">ADMIN DASHBOARD</p>

            <h1 className="mt-2 text-3xl font-bold">Welcome, {user?.name}</h1>
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

        <div className="mt-10 grid gap-6 md:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="font-semibold">Users</h2>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="font-semibold">Managers</h2>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="font-semibold">Events</h2>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="font-semibold">Bookings</h2>
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
