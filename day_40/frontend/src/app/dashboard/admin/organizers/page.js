"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoutes";
import { apiRequest } from "@/components/utils/api.js";

function OrganizersPageContent() {
  const router = useRouter();

  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  const [profileImages, setProfileImages] = useState({});

  useEffect(() => {
    fetchOrganizers();
  }, []);

  useEffect(() => {
    if (organizers.length === 0) return;

    const images = {};

    organizers.forEach((organizer) => {
      const userKey = organizer._id || organizer.id || organizer.email;

      const savedImage = localStorage.getItem(`profileImage_${userKey}`);

      if (savedImage) {
        images[userKey] = savedImage;
      }
    });

    setProfileImages(images);
  }, [organizers]);

  async function fetchOrganizers() {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest("/admin/users");

      const users = response.data || [];

      const organizerUsers = users.filter((user) => user.role === "organizer");

      setOrganizers(organizerUsers);
    } catch (error) {
      console.error("Failed to fetch organizers:", error);
      setError(error.message || "Failed to load organizers");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(organizerId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this organizer?",
    );

    if (!confirmed) return;

    try {
      setDeletingId(organizerId);
      setError("");

      await apiRequest(`/admin/users/${organizerId}`, {
        method: "DELETE",
      });

      setOrganizers((currentOrganizers) =>
        currentOrganizers.filter((organizer) => organizer._id !== organizerId),
      );
    } catch (error) {
      console.error("Failed to delete organizer:", error);
      setError(error.message || "Failed to delete organizer");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredOrganizers = organizers.filter((organizer) => {
    const searchValue = search.toLowerCase();

    return (
      organizer.name?.toLowerCase().includes(searchValue) ||
      organizer.email?.toLowerCase().includes(searchValue)
    );
  });

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-500">ADMIN DASHBOARD</p>

            <h1 className="mt-2 text-3xl font-bold">Organizers</h1>

            <p className="mt-2 text-slate-400">
              Manage all organizers registered on the platform.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard/admin")}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm transition hover:bg-slate-700"
          >
            ← Dashboard
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-800 bg-red-950/40 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Stats + Search */}
        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-400">Total Organizers</p>

            <p className="mt-1 text-3xl font-bold text-blue-500">
              {loading ? "..." : organizers.length}
            </p>
          </div>

          <div className="w-full md:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search organizers..."
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Organizers */}
        <div className="mt-8 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          {loading ? (
            <div className="p-10 text-center text-slate-400">
              Loading organizers...
            </div>
          ) : filteredOrganizers.length === 0 ? (
            <div className="p-10 text-center">
              <h2 className="text-lg font-semibold">No organizers found</h2>

              <p className="mt-2 text-sm text-slate-500">
                {search
                  ? "Try a different search."
                  : "There are no organizers registered yet."}
              </p>
            </div>
          ) : (
            <div>
              {/* Table Header */}
              <div className="hidden grid-cols-[2fr_3fr_1fr_auto] items-center gap-6 border-b border-slate-800 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
                <span>Organizer</span>
                <span>Email</span>
                <span>Role</span>
                <span>Action</span>
              </div>

              {/* Organizer Rows */}
              {filteredOrganizers.map((organizer) => {
                const userKey =
                  organizer._id || organizer.id || organizer.email;

                const image = profileImages[userKey];

                return (
                  <div
                    key={organizer._id}
                    className="grid gap-4 border-b border-slate-800 px-6 py-5 last:border-b-0 md:grid-cols-[2fr_3fr_1fr_auto] md:items-center md:gap-6"
                  >
                    {/* Organizer */}
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-slate-700">
                        {image ? (
                          <img
                            src={image}
                            alt={organizer.name || "Organizer"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-800 text-sm font-semibold text-slate-300">
                            {organizer.name?.charAt(0)?.toUpperCase() || "O"}
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="font-medium text-white">
                          {organizer.name}
                        </p>

                        <p className="text-xs text-slate-500 md:hidden">
                          {organizer.email}
                        </p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="hidden text-sm text-slate-400 md:block">
                      {organizer.email}
                    </div>

                    {/* Role */}
                    <div>
                      <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                        Organizer
                      </span>
                    </div>

                    {/* Delete */}
                    <div>
                      <button
                        onClick={() => handleDelete(organizer._id)}
                        disabled={deletingId === organizer._id}
                        className="rounded-lg bg-red-600/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === organizer._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
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

export default function AdminOrganizersPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <OrganizersPageContent />
    </ProtectedRoute>
  );
}
