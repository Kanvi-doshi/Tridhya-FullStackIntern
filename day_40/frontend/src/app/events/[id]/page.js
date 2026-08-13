"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiX } from "react-icons/fi";

import { useToast } from "@/components/toast/toastContext";
import { useAuth } from "@/components/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoutes";

import { getEventById } from "@/service/event.service";
import { registerForEvent } from "@/service/registration.service";

function EventDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState("");
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  useEffect(() => {
    if (!params.id) return;

    fetchEvent();
  }, [params.id]);

  async function fetchEvent() {
    try {
      setLoading(true);
      setError("");

      const response = await getEventById(params.id);

      setEvent(response.data);
    } catch (error) {
      console.error("Failed to fetch event:", error);
      setError(error.message || "Failed to load event");
    } finally {
      setLoading(false);
    }
  }

  async function fetchAttendees() {
    try {
      setAttendeeLoading(true);
      setAttendeeError("");

      const response = await getEventAttendees(params.id);

      setAttendees(response.data || []);
    } catch (error) {
      console.error("Failed to fetch attendees:", error);

      setAttendeeError(error.message || "Failed to load registered users");
    } finally {
      setAttendeeLoading(false);
    }
  }

  const isRegistered =
    event?.attendees?.some((attendee) => {
      const attendeeId = typeof attendee === "object" ? attendee._id : attendee;

      return attendeeId?.toString() === user?.id?.toString();
    }) || false;

  async function handleRegister() {
    try {
      setRegistering(true);
      setError("");

      const response = await registerForEvent(event._id);

      setEvent(response.data);

      setShowRegistrationForm(false);
      showToast("Event registered successfully", "success");
    } catch (error) {
      setError(error.message || "Failed to register for this event");
    } finally {
      setRegistering(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-slate-400">Loading event...</p>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-slate-950 p-5 text-white">
        <div className="mx-auto max-w-6xl">
          <button
            onClick={() => router.back()}
            className="mb-3 rounded-lg bg-slate-800 px-4 py-2 hover:bg-slate-700"
          >
            ← Back
          </button>

          <div className="rounded-xl border border-red-800 bg-red-950/40 p-6 text-center text-red-400">
            {error || "Event not found"}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white">
      <div className="mx-auto max-w-6xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-4 rounded-lg bg-slate-800 px-4 py-2 hover:bg-slate-700"
        >
          ← Back
        </button>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-800 bg-red-950/40 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Event Card */}
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-3">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
              {event.status?.toUpperCase() || "UPCOMING"}
            </span>

            {event.category && (
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                {event.category}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="mt-6 text-4xl font-bold">{event.title}</h1>

          {/* Description */}
          {event.description && (
            <p className="mt-5 leading-7 text-slate-400">{event.description}</p>
          )}

          {/* Event Information */}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {event.date && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-sm text-slate-500">Date</p>

                <p className="mt-2 text-lg font-medium">
                  {new Date(event.date).toLocaleDateString()}
                </p>
              </div>
            )}

            {event.location && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-sm text-slate-500">Location</p>

                <p className="mt-2 text-lg font-medium">{event.location}</p>
              </div>
            )}

            {event.capacity && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-sm text-slate-500">Capacity</p>

                <p className="mt-2 text-lg font-medium">{event.capacity}</p>
              </div>
            )}

            {event.organizer && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-sm text-slate-500">Organizer</p>

                <p className="mt-2 text-lg font-medium">
                  {event.organizer.name}
                </p>

                {event.organizer.email && (
                  <p className="mt-1 text-sm text-slate-400">
                    {event.organizer.email}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Registration */}
          <div className="mt-10">
            {isRegistered ? (
              <button
                disabled
                className="w-full cursor-not-allowed rounded-lg bg-green-700/40 px-5 py-3 font-semibold text-green-300"
              >
                Registered
              </button>
            ) : (
              <button
                onClick={() => setShowRegistrationForm(true)}
                disabled={event.status === "cancelled"}
                className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {event.status === "cancelled"
                  ? "Event Cancelled"
                  : "Register Now"}
              </button>
            )}

            {/* Registration Modal */}
            {showRegistrationForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Event Registration</h2>

                    <button
                      onClick={() => setShowRegistrationForm(false)}
                      disabled={registering}
                      className="text-xl text-slate-400 hover:text-white"
                    >
                      <FiX />
                    </button>
                  </div>

                  <p className="mt-2 text-slate-400">
                    Please confirm your registration.
                  </p>

                  {/* Event Information */}
                  <div className="mt-6 rounded-xl bg-slate-800 p-5">
                    <h3 className="text-xl font-semibold">{event.title}</h3>

                    {event.date && (
                      <p className="mt-3 text-sm text-slate-300">
                        Date: {new Date(event.date).toLocaleDateString()}
                      </p>
                    )}

                    {event.location && (
                      <p className="mt-2 text-sm text-slate-300">
                        Location: {event.location}
                      </p>
                    )}

                    {event.organizer && (
                      <p className="mt-2 text-sm text-slate-300">
                        Organizer: {event.organizer.name}
                      </p>
                    )}
                  </div>

                  {/* User Information */}
                  <div className="mt-4 rounded-xl bg-slate-800 p-5">
                    <p className="text-sm text-slate-400">Registering as</p>

                    <p className="mt-2 font-medium">{user?.name}</p>

                    <p className="text-sm text-slate-400">{user?.email}</p>
                  </div>

                  {/* Buttons */}
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setShowRegistrationForm(false)}
                      disabled={registering}
                      className="rounded-lg bg-slate-700 px-5 py-2 hover:bg-slate-600 disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleRegister}
                      disabled={registering}
                      className="rounded-lg bg-blue-600 px-5 py-2 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {registering ? "Registering..." : "Confirm Registration"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function EventDetailsPage() {
  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <EventDetailsContent />
    </ProtectedRoute>
  );
}
