"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getEventById, updateEvent } from "@/service/event.service";
import ProtectedRoute from "@/components/auth/ProtectedRoutes";
import { useToast } from "@/components/toast/toastContext";

function EditEventContent() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "",
    capacity: "",
    status: "upcoming",
  });

  useEffect(() => {
    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

  async function fetchEvent() {
    try {
      setLoading(true);
      setError("");

      const response = await getEventById(params.id);

      const event = response.data;

      setFormData({
        title: event.title || "",
        description: event.description || "",
        date: event.date ? new Date(event.date).toISOString().slice(0, 16) : "",
        location: event.location || "",
        category: event.category || "",
        capacity: event.capacity || "",
        status: event.status || "upcoming",
      });
    } catch (error) {
      console.error("Failed to load event:", error);

      setError(error.message || "Failed to load event");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const updates = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        location: formData.location,
        category: formData.category,
        capacity: Number(formData.capacity),
        status: formData.status,
      };

      await updateEvent(params.id, updates);

      showToast("Event updated successfully", "success");

      router.push(`/events/${params.id}`);
    } catch (error) {
      console.error("Failed to update event:", error);

      setError(error.message || "Failed to update event");

      showToast(error.message || "Failed to update event", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-slate-400">Loading event...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-4xl">
        {/* Back */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 rounded-lg bg-slate-800 px-4 py-2 hover:bg-slate-700"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-blue-500">ORGANIZER</p>

          <h1 className="mt-2 text-3xl font-bold">Edit Event</h1>

          <p className="mt-2 text-slate-400">Update your event information.</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-800 bg-red-950/40 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-8"
        >
          {/* Title */}
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Event Title
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              placeholder="Enter event title"
            />
          </div>

          {/* Description */}
          <div className="mt-5">
            <label className="mb-2 block text-sm text-slate-300">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              required
              className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              placeholder="Enter event description"
            />
          </div>

          {/* Date */}
          <div className="mt-5">
            <label className="mb-2 block text-sm text-slate-300">Date</label>

            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Time</label>

            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition duration-200 hover:border-slate-500 focus:border-blue-500"
            />
          </div>

          {/* Location */}
          <div className="mt-5">
            <label className="mb-2 block text-sm text-slate-300">
              Location
            </label>

            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              placeholder="Enter event location"
            />
          </div>

          {/* Category + Capacity */}
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Category
              </label>

              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
                placeholder="Example: Technology"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Capacity
              </label>

              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
                placeholder="Enter capacity"
              />
            </div>
          </div>

          {/* Status */}
          <div className="mt-5">
            <label className="mb-2 block text-sm text-slate-300">Status</label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
            >
              <option value="upcoming">Upcoming</option>

              <option value="ongoing">Ongoing</option>

              <option value="completed">Completed</option>

              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push(`/events/${params.id}`)}
              disabled={saving}
              className="rounded-lg bg-slate-700 px-5 py-3 hover:bg-slate-600 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function EditEventPage() {
  return (
    <ProtectedRoute allowedRoles={["organizer"]}>
      <EditEventContent />
    </ProtectedRoute>
  );
}
