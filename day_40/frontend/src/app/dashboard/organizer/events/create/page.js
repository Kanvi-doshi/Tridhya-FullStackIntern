"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoutes";
import { createEventService } from "@/service/event.service";
import { useToast } from "@/components/context/ToastContext";

function CreateEventContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "",
    capacity: "",
  });

  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    // Remove error for the field being edited
    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.capacity) {
      newErrors.capacity = "Capacity is required";
    } else if (Number(formData.capacity) <= 0) {
      newErrors.capacity = "Capacity must be greater than 0";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please fix the errors in the form", "error");
      return;
    }

    try {
      setLoading(true);

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date,
        location: formData.location.trim(),
        category: formData.category,
        capacity: Number(formData.capacity),
      };

      await createEventService(eventData);

      showToast("Event created successfully", "success");

      router.push("/organizer/events");
    } catch (error) {
      console.error("Failed to create event:", error);

      showToast(error.message || "Failed to create event", "error");
    } finally {
      setLoading(false);
    }
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

          <h1 className="mt-2 text-3xl font-bold">Create Event</h1>

          <p className="mt-2 text-slate-400">
            Create a new event for users to discover and register for.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-8"
        >
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Event Title
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter event title"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

              {errors.title && (
                <p className="mt-2 text-sm text-red-400">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder="Describe your event"
                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

              {errors.description && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Date + Capacity */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Date */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Date
                </label>

                <input
                  type="datetime-local"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
                />

                {errors.date && (
                  <p className="mt-2 text-sm text-red-400">{errors.date}</p>
                )}
              </div>

              {/* Capacity */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Capacity
                </label>

                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  placeholder="e.g. 100"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
                />

                {errors.capacity && (
                  <p className="mt-2 text-sm text-red-400">{errors.capacity}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Location
              </label>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter event location"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

              {errors.location && (
                <p className="mt-2 text-sm text-red-400">{errors.location}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="">Select category</option>
                <option value="Technology">Technology</option>
                <option value="Business">Business</option>
                <option value="Music">Music</option>
                <option value="Sports">Sports</option>
                <option value="Education">Education</option>
                <option value="Workshop">Workshop</option>
                <option value="Other">Other</option>
              </select>

              {errors.category && (
                <p className="mt-2 text-sm text-red-400">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex justify-end gap-4 border-t border-slate-800 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="rounded-lg bg-slate-700 px-6 py-3 hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
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
    </main>
  );
}

export default function CreateEventPage() {
  return (
    <ProtectedRoute allowedRoles={["organizer"]}>
      <CreateEventContent />
    </ProtectedRoute>
  );
}
