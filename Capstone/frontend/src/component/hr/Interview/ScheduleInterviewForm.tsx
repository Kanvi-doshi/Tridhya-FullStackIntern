import { useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import type { InterviewAssignment } from "./ScheduledInterview";

interface Props {
  rounds: {
    id: string;
    roundNumber: number;
    title: string;
  }[];

  applications: {
    id: string;
    candidate?: {
      name: string;
      email: string;
    };
  }[];

  interviewers: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
  }[];
  assignments: InterviewAssignment[];

  assignment?: InterviewAssignment | null;
  onClose: () => void;

  onSchedule: (
    applicationId: string,
    roundId: string,
    data: {
      interviewerId: string;
      scheduledAt: string;
      endsAt: string;
      location: string;
    },
  ) => Promise<void>;
}

// datetime-local requires local time, not an ISO UTC value.
function toLocalInput(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

export default function ScheduleInterviewForm({
  rounds,
  applications,
  interviewers,
  assignment,
  assignments,
  onClose,
  onSchedule,
}: Props) {
  const [applicationId, setApplicationId] = useState(
    assignment?.application?.id ?? "",
  );
  const [roundId, setRoundId] = useState(assignment?.round?.id ?? "");
  const [interviewerId, setInterviewerId] = useState(
    assignment?.interviewer?.id ?? "",
  );
  const [scheduledAt, setScheduledAt] = useState(
    toLocalInput(assignment?.scheduledAt),
  );
  const [endsAt, setEndsAt] = useState(toLocalInput(assignment?.endsAt));
  const [location, setLocation] = useState(assignment?.location ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const start = new Date(scheduledAt);
  const end = new Date(endsAt);

  const validSlot =
    Number.isFinite(start.getTime()) &&
    Number.isFinite(end.getTime()) &&
    start.getTime() > Date.now() &&
    end.getTime() > start.getTime();

  const activeInterviewer = interviewers.some(
    (interviewer) => interviewer.id === interviewerId && interviewer.isActive,
  );

  const conflict =
    validSlot && interviewerId
      ? assignments.find(
          (booking) =>
            booking.id !== assignment?.id &&
            booking.interviewer?.id === interviewerId &&
            ["SCHEDULED", "IN_PROGRESS"].includes(booking.status) &&
            (!booking.endsAt ||
              (new Date(booking.scheduledAt).getTime() < end.getTime() &&
                new Date(booking.endsAt).getTime() > start.getTime())),
        )
      : undefined;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving) return;

    setError("");

    if (
      !Number.isFinite(start.getTime()) ||
      !Number.isFinite(end.getTime()) ||
      start.getTime() <= Date.now() ||
      end.getTime() <= start.getTime()
    ) {
      setError("Choose a future start time and an end time after it.");
      return;
    }

    if (
      !interviewers.some(
        (interviewer) =>
          interviewer.id === interviewerId && interviewer.isActive,
      )
    ) {
      setError("Choose an active interviewer.");
      return;
    }
    if (conflict) {
      setError(
        conflict.endsAt
          ? "This interviewer already has an interview during this slot."
          : "This interviewer has a booking without an end time. Update or cancel that booking first.",
      );
      return;
    }
    try {
      setSaving(true);

      await onSchedule(applicationId, roundId, {
        interviewerId,
        scheduledAt: start.toISOString(),
        endsAt: end.toISOString(),
        location: location.trim(),
      });

      onClose();
    } catch (error: unknown) {
      setError(
        axios.isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message || "Unable to save interview."
          : "Unable to save interview.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="interview-form-title"
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-slate-200 bg-white px-6 py-4">
          <h2
            id="interview-form-title"
            className="text-lg font-bold text-slate-800"
          >
            {assignment ? "Reschedule Interview" : "Schedule Interview"}
          </h2>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Close"
            className="text-slate-500 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto px-5 py-5"
        >
          <fieldset disabled={saving} className="space-y-4">
            {assignment ? (
              <div className="rounded-xl bg-slate-50 p-3 text-sm">
                <p className="font-semibold text-slate-800">
                  {assignment.application?.candidate?.name ?? "Candidate"}
                </p>
                <p className="mt-1 text-slate-500">
                  {assignment.round?.title ?? "Interview"}
                </p>
              </div>
            ) : (
              <>
                <label className="block text-sm font-medium text-slate-700">
                  Candidate
                  <select
                    required
                    value={applicationId}
                    onChange={(event) => setApplicationId(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <option value="">Select approved candidate</option>
                    {applications.map((application) => (
                      <option key={application.id} value={application.id}>
                        {application.candidate?.name ?? application.id}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Interview round
                  <select
                    required
                    value={roundId}
                    onChange={(event) => setRoundId(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <option value="">Select interview round</option>
                    {rounds.map((round) => (
                      <option key={round.id} value={round.id}>
                        Round {round.roundNumber}: {round.title}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}

            <label className="block text-sm font-medium text-slate-700">
              Interviewer
              <select
                required
                value={interviewerId}
                onChange={(event) => setInterviewerId(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
              >
                <option value="">Select active interviewer</option>
                {interviewers
                  .filter((interviewer) => interviewer.isActive)
                  .map((interviewer) => (
                    <option key={interviewer.id} value={interviewer.id}>
                      {interviewer.name}
                    </option>
                  ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Start date and time
              <input
                type="datetime-local"
                required
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              End date and time
              <input
                type="datetime-local"
                required
                min={scheduledAt || undefined}
                value={endsAt}
                onChange={(event) => setEndsAt(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>

            <p className="text-xs text-slate-500">
              Times use your local timezone.
            </p>
            {interviewerId && validSlot && (
              <div
                role="status"
                className={`rounded-lg border p-3 text-sm ${
                  !activeInterviewer || conflict
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-green-200 bg-green-50 text-green-700"
                }`}
              >
                {!activeInterviewer ? (
                  <p>This interviewer is inactive.</p>
                ) : conflict ? (
                  <>
                    <p className="font-semibold">
                      Busy — choose another slot or interviewer.
                    </p>

                    <p className="mt-1">
                      Existing interview:{" "}
                      {new Date(conflict.scheduledAt).toLocaleString()}
                      {" → "}
                      {conflict.endsAt
                        ? new Date(conflict.endsAt).toLocaleString()
                        : "End time missing"}
                    </p>
                  </>
                ) : (
                  <p>
                    Available based on loaded bookings. Availability is checked
                    again when you save.
                  </p>
                )}
              </div>
            )}

            <label className="block text-sm font-medium text-slate-700">
              Location / meeting link
              <input
                required
                minLength={2}
                maxLength={255}
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
              >
                {error}
              </p>
            )}

            <div className="flex justify-end ">
             
              <button
                type="submit"
                disabled={
                  saving ||
                  !applicationId ||
                  !roundId ||
                  !interviewerId ||
                  !validSlot ||
                  !activeInterviewer ||
                  Boolean(conflict)
                }
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : assignment
                    ? "Save Changes"
                    : "Schedule Interview"}
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
