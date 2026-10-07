import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  Sparkles,
  Video,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import api from "../../services/api";
import { HRRealtimeContext } from "../../context/RealtimeContext";
import NotificationBell from "../../component/NotificationBell";

interface Assignment {
  id: string;
  status: string;
  scheduledAt: string;
}

const InterviewerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const revision = useContext(HRRealtimeContext);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/interview-assignment/my");

        if (cancelled) return;
        setAssignments(response.data.assignments || []);
      } catch (error: any) {
        if (cancelled) return;
        console.error(error);

        setError(
          error.response?.data?.message || "Failed to load interview dashboard",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAssignments();
    return () => {
      cancelled = true;
    };
  }, [revision]);

  const completed = assignments.filter(
    (assignment) => assignment.status === "COMPLETED",
  ).length;

  const pending = assignments.filter((assignment) =>
    ["SCHEDULED", "IN_PROGRESS"].includes(assignment.status),
  ).length;

  const upcoming = assignments.filter((assignment) => {
    return (
      assignment.status !== "COMPLETED" &&
      assignment.status !== "CANCELLED" &&
      new Date(assignment.scheduledAt) >= new Date()
    );
  }).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          <p className="mt-4 text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* NAVBAR */}

      <nav className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
              <Sparkles size={19} />
            </div>

            <h1 className="text-lg font-bold">SmartHire AI</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/profile")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-bold text-violet-600 transition hover:scale-105"
            >
              {user?.name?.charAt(0).toUpperCase() || "I"}
            </button>
            <NotificationBell />
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-violet-600">
            Interviewer Dashboard
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-800">
            Welcome back, {user?.name}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Review your assigned interviews and submit candidate feedback.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* STATS */}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Assigned"
            value={assignments.length}
            icon={<Video size={20} />}
          />

          <StatCard
            title="Upcoming"
            value={upcoming}
            icon={<CalendarDays size={20} />}
          />

          <StatCard
            title="Pending"
            value={pending}
            icon={<Clock3 size={20} />}
          />

          <StatCard
            title="Completed"
            value={completed}
            icon={<CheckCircle2 size={20} />}
          />
        </div>

        {/* QUICK ACTIONS */}

        <div className="mt-8">
          <h3 className="font-bold text-slate-800">Quick Actions</h3>

          <p className="mt-1 text-sm text-slate-400">
            Manage your interviews and feedback
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <QuickAction
              title="My Interviews"
              description="View assigned and upcoming interviews"
              icon={<Video size={21} />}
              onClick={() => navigate("/interview")}
            />

            <QuickAction
              title="Feedback History"
              description="View your submitted interview feedback"
              icon={<MessageSquareText size={21} />}
              onClick={() => navigate("/feedback")}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
          {icon}
        </div>
      </div>
    </div>
  );
};

const QuickAction = ({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-md"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white">
        {icon}
      </div>

      <div>
        <h4 className="font-semibold text-slate-700">{title}</h4>
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      </div>
    </button>
  );
};

export default InterviewerDashboard;
