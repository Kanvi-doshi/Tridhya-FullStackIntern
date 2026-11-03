import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarPlus,
  Search,
  Users,
  Video,
} from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createInterviewAssignment,
  createInterviewRound,
  deleteInterviewRound,
  updateInterviewRound,
  updateInterviewAssignment,
} from "../../services/interviewService";
import InterviewRounds, {
  type InterviewRound,
} from "../../component/hr/Interview/interviewRound";
import ScheduledInterviews, {
  type InterviewAssignment,
} from "../../component/hr/Interview/ScheduledInterview";
import RoundForm from "../../component/hr/Interview/roundForm";
import ScheduleInterviewForm from "../../component/hr/Interview/ScheduleInterviewForm";
import {
  getErrorMessage,
  useHRAssignments,
  useHRRounds,
  useInterviewers,
  useJobApplications,
  useJobs,
  useRefreshData,
} from "../../component/hooks/queries";

interface Job {
  id: string;
  title: string;
  location: string;
  status: string;
}

interface Application {
  id: string;
  status: string;
  candidate?: {
    id: string;
    name: string;
    email: string;
  };
}

interface Interviewer {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

const HRInterviews = () => {
  const navigate = useNavigate();
  const refresh = useRefreshData();
  const {
    data: jobs = [],
    isLoading: jobsLoading,
    error: jobsError,
  } = useJobs<Job>();
  const [selectedJobId, setSelectedJobId] = useState("");

  const { data: rounds = [], error: roundsError } = useHRRounds(selectedJobId);
  const { data: applications = [], error: applicationsError } =
    useJobApplications<Application>(selectedJobId);

  const {
    data: assignments = [],
    isLoading: assignmentsLoading,
    error: assignmentsError,
  } = useHRAssignments();
  const { data: interviewers = [] } = useInterviewers<Interviewer>();

  const [actionError, setError] = useState("");
  const loadError =
    jobsError || assignmentsError || roundsError || applicationsError;
  const error =
    actionError ||
    (loadError
      ? getErrorMessage(loadError, "Failed to load interview management")
      : "");
  const loading = assignmentsLoading || jobsLoading;

  const [showRoundForm, setShowRoundForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingRound, setEditingRound] = useState<InterviewRound | null>(null);

  const [editingAssignment, setEditingAssignment] =
    useState<InterviewAssignment | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // INITIAL DATA
  useEffect(() => {
    if (!selectedJobId && jobs.length > 0) setSelectedJobId(jobs[0].id);
  }, [jobs, selectedJobId]);

  // SAVE ROUND
  const handleSaveRound = async (data: {
    roundNumber: number;
    title: string;
    type: string;
    description?: string;
    durationMinutes?: number;
    passingScore?: number;
    isActive: boolean;
  }) => {
    // The form displays save errors and keeps the entered values.
    if (editingRound) {
      await updateInterviewRound(editingRound.id, data);
    } else {
      await createInterviewRound(selectedJobId, data);
    }
    setEditingRound(null);
    await refresh.rounds();
  };

  const handleDeleteRound = async (roundId: string) => {
    if (
      !window.confirm("Are you sure you want to delete this interview round?")
    )
      return;

    try {
      await deleteInterviewRound(roundId);
      await Promise.all([refresh.rounds(), refresh.interviews(), refresh.questions()]); // assignments may reference the round
    } catch (error: any) {
      alert(
        error.response?.data?.message || "Failed to delete interview round",
      );
    }
  };

  const handleCancelInterview = async (id: string) => {
    if (cancellingId) return;

    if (
      !window.confirm(
        "Cancel this interview? Cancelled bookings cannot be reopened. Use Reschedule if you only want to change the time.",
      )
    ) {
      return;
    }

    setCancellingId(id);
    setError("");

    try {
      await updateInterviewAssignment(id, {
        status: "CANCELLED",
      });
      await refresh.interviews();
    } catch (error: unknown) {
      setError(
        axios.isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message || "Unable to cancel interview."
          : "Unable to cancel interview.",
      );
    } finally {
      setCancellingId(null);
    }
  };

  const handleScheduleInterview = async (
    applicationId: string,
    roundId: string,
    data: {
      interviewerId: string;
      scheduledAt: string;
      location: string;
      endsAt: string;
    },
  ) => {
    setError("");
    if (editingAssignment) {
      await updateInterviewAssignment(editingAssignment.id, data);
    } else {
      await createInterviewAssignment(applicationId, roundId, data);
    }
    await refresh.interviews();
  };

  if (loading || jobsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />

          <p className="mt-4 text-sm text-slate-500">Loading interviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm transition hover:bg-violet-50"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-white">
                Interview Management
              </h1>

              <p className="mt-1 text-sm text-violet-100">
                Manage rounds and schedule candidate interviews
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setEditingAssignment(null);
                setShowScheduleForm(true);
              }}
              disabled={!selectedJobId || rounds.length === 0}
              className="flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-violet-600 shadow-sm transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CalendarPlus size={17} />
              Schedule Interview
            </button>
            <button
              type="button"
              onClick={() => navigate("/interviewers")}
              className="flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-violet-600 shadow-sm transition hover:bg-violet-50"
            >
              <Users size={17} />
              Manage Interviewers
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* STATS */}
        <div className="grid gap-5 sm:grid-cols-3">
          <StatCard
            title="Interview Rounds"
            value={rounds.length}
            icon={<BriefcaseBusiness size={20} />}
          />

          <StatCard
            title="Scheduled"
            value={
              assignments.filter(
                (assignment) => assignment.status === "SCHEDULED",
              ).length
            }
            icon={<CalendarPlus size={20} />}
          />

          <StatCard
            title="Total Interviews"
            value={assignments.length}
            icon={<Video size={20} />}
          />
        </div>

        {/* JOB SELECTION */}
        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-6">
          <div>
            <h2 className="font-bold text-slate-800">Select Job</h2>

            <p className="mt-1 text-sm text-slate-400">
              Select a job to manage its interview process
            </p>
          </div>

          {jobs.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 py-10 text-center">
              <BriefcaseBusiness size={32} className="mx-auto text-slate-300" />

              <p className="mt-3 text-sm text-slate-500">No jobs available.</p>
            </div>
          ) : (
            <div className="relative mt-5 max-w-lg">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={selectedJobId}
                onChange={(event) => setSelectedJobId(event.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              >
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} - {job.location}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ROUNDS */}
        {selectedJobId && (
          <div className="mt-6">
            <InterviewRounds
              rounds={rounds}
              onAdd={() => {
                setEditingRound(null);
                setShowRoundForm(true);
              }}
              onEdit={(round) => {
                setEditingRound(round);
                setShowRoundForm(true);
              }}
              onDelete={handleDeleteRound}
            />
          </div>
        )}

        {/* ASSIGNMENTS */}
        <div className="mt-6">
          <ScheduledInterviews
            assignments={assignments}
            onEdit={(assignment) => {
              setEditingAssignment(assignment);
              setShowScheduleForm(true);
            }}
            onCancel={handleCancelInterview}
            cancellingId={cancellingId}
          />
        </div>
      </main>

      {/* ROUND MODAL */}
      {showRoundForm && (
        <RoundForm
          round={editingRound}
          onClose={() => {
            setShowRoundForm(false);
            setEditingRound(null);
          }}
          onSave={handleSaveRound}
        />
      )}

      {/* SCHEDULE MODAL */}
      {showScheduleForm && (
        <ScheduleInterviewForm
          key={editingAssignment?.id ?? "new"}
          assignment={editingAssignment}
          assignments={assignments}
          rounds={rounds.filter(
            (round) => round.type === "INTERVIEW" && round.isActive,
          )}
          applications={applications.filter(
            (application) => application.status === "INTERVIEWING",
          )}
          interviewers={interviewers}
          onClose={() => {
            setShowScheduleForm(false);
            setEditingAssignment(null);
          }}
          onSchedule={handleScheduleInterview}
        />
      )}
    </div>
  );
};

// STAT CARD
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, icon }: StatCardProps) => {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50  hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition-colors group-hover:bg-violet-600 group-hover:text-white">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default HRInterviews;
