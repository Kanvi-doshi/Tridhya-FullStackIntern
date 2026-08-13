"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoutes";
import { apiRequest } from "@/components/utils/api.js";

function AdminUsersPageContent() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, search, roleFilter]);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest("/admin/users");

      const userData = response.data || [];

      setUsers(userData);
    } catch (error) {
      console.error("Failed to fetch users:", error);

      setError(error.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  function filterUsers() {
    let result = [...users];

    if (search.trim()) {
      const searchValue = search.toLowerCase();

      result = result.filter((user) => {
        const name = user.name?.toLowerCase() || "";
        const email = user.email?.toLowerCase() || "";

        return name.includes(searchValue) || email.includes(searchValue);
      });
    }

    if (roleFilter !== "all") {
      result = result.filter((user) => user.role?.toLowerCase() === roleFilter);
    }

    setFilteredUsers(result);
  }

  async function handleRoleChange(userId, newRole) {
    try {
      setError("");

      const response = await apiRequest(`/admin/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({
          role: newRole,
        }),
      });

      const updatedUser = response.data;

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === userId ? { ...user, ...updatedUser } : user,
        ),
      );
    } catch (error) {
      console.error("Failed to update role:", error);

      setError(error.message || "Failed to update user role");
    }
  }

  async function handleDelete(userId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?",
    );

    if (!confirmed) return;

    try {
      setError("");

      await apiRequest(`/admin/users/${userId}`, {
        method: "DELETE",
      });

      setUsers((currentUsers) =>
        currentUsers.filter((user) => user._id !== userId),
      );
    } catch (error) {
      console.error("Failed to delete user:", error);

      setError(error.message || "Failed to delete user");
    }
  }

  function getRoleStyle(role) {
    if (role === "admin") {
      return "bg-red-500/10 text-red-400";
    }

    if (role === "organizer") {
      return "bg-purple-500/10 text-purple-400";
    }

    return "bg-blue-500/10 text-blue-400";
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-500">ADMIN DASHBOARD</p>

            <h1 className="mt-2 text-3xl font-bold">Manage Users</h1>

            <p className="mt-2 text-slate-400">
              View and manage all registered users.
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
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="organizer">Organizers</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {/* User Count */}
        <div className="mt-6">
          <p className="text-sm text-slate-400">
            Showing{" "}
            <span className="font-semibold text-white">
              {filteredUsers.length}
            </span>{" "}
            of <span className="font-semibold text-white">{users.length}</span>{" "}
            users
          </p>
        </div>

        {/* Users */}
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          {loading ? (
            <div className="p-10 text-center text-slate-400">
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-10 text-center">
              <h2 className="text-lg font-semibold">No users found</h2>

              <p className="mt-2 text-sm text-slate-400">
                Try changing your search or filter.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="p-5 transition hover:bg-slate-800/40"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* User Info */}
                    <div className="flex min-w-0 items-center gap-4">
                      {/* Profile */}
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-800 text-lg font-semibold text-slate-300">
                        {user.profileImage ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}${user.profileImage}`}
                            alt={user.name || "User"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          user.name?.charAt(0)?.toUpperCase() || "U"
                        )}
                      </div>

                      {/* Details */}
                      <div className="min-w-0">
                        <h2 className="truncate font-semibold">{user.name}</h2>

                        <p className="truncate text-sm text-slate-400">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Role */}
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getRoleStyle(
                          user.role,
                        )}`}
                      >
                        {user.role}
                      </span>

                      {/* Change Role */}
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user._id, e.target.value)
                        }
                        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                      >
                        <option value="user">User</option>

                        <option value="organizer">Organizer</option>

                        <option value="admin">Admin</option>
                      </select>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="rounded-lg bg-red-600/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-600 hover:text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function AdminUsersPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminUsersPageContent />
    </ProtectedRoute>
  );
}
