"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoutes";
import { createEvent } from "@/service/event.service";

function CreateEventContent() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "",
    capacity: "",
    status: "upcoming",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setLoading(true);
      setError("");

      const eventData = {
        ...formData,
        capacity: Number(formData.capacity),
      };

      await createEvent(eventData);

      router.push("/events");
    } catch (error) {
      console.error("Failed to create event:", error);

      setError(error.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-3 text-white">
      <button
        type="button"
        onClick={() => router.back()}
        className=" ml-25 mt-1 mb-2 rounded-lg bg-slate-800 px-4 py-2 hover:bg-slate-700"
      >
        ← Back
      </button>
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="mb-3">
            <h1 className=" text-3xl font-bold">Create Event</h1>

          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-800 bg-red-950/40 p-4 text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Enter event title"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={2}
                placeholder="Enter event description"
                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none focus:border-blue-500"
              />
            </div>

            {/* Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition duration-200 hover:border-blue-500 hover:bg-slate-750 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Time
                </label>

                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition duration-200 hover:border-slate-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="Enter event location"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition duration-200 hover:border-blue-500 hover:bg-slate-750 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              {/* Capacity */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Capacity
                </label>

                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="Enter maximum attendees"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition duration-200 hover:border-blue-500 hover:bg-slate-750 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition duration-200 hover:border-blue-500 hover:bg-slate-750 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="" disabled>
                    Select a category
                  </option>

                  <option value="Technology">Technology</option>
                  <option value="Music">Music</option>
                  <option value="Sports">Sports</option>
                  <option value="Business">Business</option>
                  <option value="Education">Education</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Health">Health</option>
                  <option value="Art">Art</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="rounded-lg bg-slate-700 px-6 py-3 hover:bg-slate-600 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function CreateEventPage() {
  return (
    <ProtectedRoute allowedRoles={["organizer", "admin"]}>
      <CreateEventContent />
    </ProtectedRoute>
  );
}
