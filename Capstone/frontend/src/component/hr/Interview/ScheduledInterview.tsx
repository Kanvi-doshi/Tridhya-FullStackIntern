import { CalendarDays, Clock3, MapPin, User, Video } from "lucide-react";

export interface InterviewAssignment {
  id: string;
  scheduledAt: string;
  endsAt: string | null;
  location: string;
  status: string;

  interviewer?: {
    id: string;
    name: string;
    email: string;
  };

  round?: {
    id: string;
    roundNumber: number;
    title: string;
    type: string;
  };

  application?: {
    id: string;

    candidate?: {
      id: string;
      name: string;
      email: string;
    };

    job?: {
      id: string;
      title: string;
    };
  };
}

interface ScheduledInterviewsProps {
  assignments: InterviewAssignment[];
  onEdit: (assignment: InterviewAssignment) => void;
  onCancel: (id: string) => Promise<void>;
  cancellingId: string | null;
}

const ScheduledInterviews = ({
  assignments,
  onEdit,
  onCancel,
  cancellingId,
}: ScheduledInterviewsProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Video size={19} />
          </div>

          <div>
            <h2 className="font-bold text-slate-800">Scheduled Interviews</h2>

            <p className="mt-1 text-sm text-slate-400">
              View all assigned candidate interviews
            </p>
          </div>
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <CalendarDays size={36} className="mx-auto text-slate-300" />

          <h3 className="mt-4 font-semibold text-slate-700">
            No interviews scheduled
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Scheduled candidate interviews will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 p-6 lg:grid-cols-2">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="rounded-xl border border-slate-200 p-5 transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-violet-500">
                    {assignment.round?.title || "Interview"}
                  </p>

                  <h3 className="mt-1 font-bold text-slate-800">
                    {assignment.application?.candidate?.name || "Candidate"}
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    {assignment.application?.job?.title || "Job"}
                  </p>
                </div>

                <StatusBadge status={assignment.status} />
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <User size={15} />
                  Interviewer: {assignment.interviewer?.name || "Not available"}
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <CalendarDays size={15} />

                  {new Date(assignment.scheduledAt).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock3 size={15} />

                  {new Date(assignment.scheduledAt).toLocaleTimeString(
                    "en-IN",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock3 size={15} aria-hidden="true" />

                  <span>
                    Ends:{" "}
                    {assignment.endsAt
                      ? new Date(assignment.endsAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "End time required"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin size={15} />

                  {assignment.location}
                </div>
              </div>
              {["SCHEDULED", "IN_PROGRESS"].includes(assignment.status) && (
                <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
                  {assignment.status === "SCHEDULED" && (
                    <button
                      type="button"
                      disabled={cancellingId !== null}
                      onClick={() => onEdit(assignment)}
                      className="rounded-lg border border-violet-200 px-4 py-2 text-sm font-semibold text-violet-600 hover:bg-violet-50 disabled:opacity-50"
                    >
                      Reschedule
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={cancellingId !== null}
                    onClick={() => void onCancel(assignment.id)}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {cancellingId === assignment.id
                      ? "Cancelling..."
                      : "Cancel Interview"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  let style = "bg-slate-100 text-slate-600";

  if (status === "SCHEDULED") {
    style = "bg-blue-100 text-blue-700";
  }

  if (status === "COMPLETED") {
    style = "bg-green-100 text-green-700";
  }

  if (status === "CANCELLED") {
    style = "bg-red-100 text-red-700";
  }

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>
      {status}
    </span>
  );
};

export default ScheduledInterviews;
