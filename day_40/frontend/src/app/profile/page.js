"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoutes";

import {
  getMyProfile,
  updateMyProfile,
  deleteMyProfile,
} from "@/service/profile.service";

function ProfileContent() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      setError("");

      const response = await getMyProfile();

      const profileData = response.data;

      setProfile(profileData);

      setFormData({
        name: profileData.name || "",
        email: profileData.email || "",
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);

      setError(error.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleUpdate(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await updateMyProfile(formData);

      setProfile(response.data);

      setFormData({
        name: response.data.name || "",
        email: response.data.email || "",
      });

      setEditing(false);

      setSuccess("Profile updated successfully.");
    } catch (error) {
      console.error("Failed to update profile:", error);

      setError(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteMyProfile();

      logout();

      router.replace("/login");
    } catch (error) {
      console.error("Failed to delete account:", error);

      setError(error.message || "Failed to delete account");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-slate-400">Loading profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-7 text-white">
      <button
        onClick={() => router.back()}
        className="mb-1 rounded-lg bg-slate-800 px-4 py-2 hover:bg-slate-700"
      >
        ← Back
      </button>

      <div className="mx-auto max-w-3xl">
        {/* Back */}

        {/* Header */}
        <div className="mb-3">
          {/* <p className="text-sm text-blue-500">ACCOUNT</p> */}

          <h1 className="mt-1 text-3xl font-bold">My Profile</h1>

          <p className="mt-2 text-slate-400">
            View and manage your account information.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-800 bg-red-950/40 p-4 text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-800 bg-green-950/40 p-4 text-green-400">
            {success}
          </div>
        )}

        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          {/* Top */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h2 className="text-xl font-semibold">Personal Information</h2>

              <p className="mt-1 text-sm text-slate-400">
                Your account details
              </p>
            </div>

            {!editing && (
              <button
                onClick={() => {
                  setEditing(true);
                  setSuccess("");
                  setError("");
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Edit Form */}
          {editing ? (
            <form onSubmit={handleUpdate} className="mt-3 space-y-2">
              <div>
                <label className="mb-1 block text-sm text-slate-300">
                  Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-300">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  className="rounded-lg bg-slate-700 px-5 py-2 hover:bg-slate-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            /* View Profile */
            <div className="mt-2 space-y-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950 py-3 px-5">
                <p className="text-sm text-slate-500">Name</p>

                <p className="text-lg font-medium">{profile?.name}</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 py-3 px-5">
                <p className="text-sm text-slate-500">Email</p>

                <p className="text-lg font-medium">{profile?.email}</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 py-3 px-5">
                <p className="text-sm text-slate-500">Role</p>

                <p className="text-lg font-medium capitalize">
                  {profile?.role}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className=" grid grid-cols-3 mt-8 rounded-2xl border border-red-900/60 bg-red-950/20 p-8">
          <div className="col-span-2">
            <h2 className="text-xl font-semibold text-red-400">Danger Zone</h2>

            <p className="mt-2 text-sm text-slate-400">
              Deleting your account is permanent and cannot be undone.
            </p>
          </div>

          <button
            onClick={handleDelete}
            className="rounded-lg bg-red-600 px-5 py-2 font-medium hover:bg-red-700"
          >
            Delete Account
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <ProfileContent />
    </ProtectedRoute>
  );
}
