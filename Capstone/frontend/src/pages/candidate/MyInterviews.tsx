import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  UserRound,
  Layers3,
  BriefcaseBusiness,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { HRRealtimeContext } from "../../context/RealtimeContext";

interface Interview {
  id: string;
  scheduledAt: string;
  location: string;
  status: string;

  application: {
    id: string;

    job: {
      id: string;
      title: string;
      location?: string;
    };
  };

  round?: {
    id: string;
    name: string;
    type: string;
  };

  interviewer?: {
    id: string;
    name: string;
    email: string;
  };
}

const CanMyInterviews = () => {
  const navigate = useNavigate();
  const revision = useContext(HRRealtimeContext);

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchInterviews = async () => {
      try {
        setError("");
        const response = await api.get("/interview-assignment/candidate/my");
        if (!cancelled) setInterviews(response.data.assignments || []);
      } catch {
        if (!cancelled) setError("Failed to load interviews.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchInterviews();
    return () => { cancelled = true; };
  }, [revision]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      case "IN_PROGRESS":
        return "bg-amber-100 text-amber-700";

      case "SCHEDULED":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 size={14} />;

      case "CANCELLED":
        return <XCircle size={14} />;

      default:
        return <Clock3 size={14} />;
    }
  };

  const sortedInterviews = [...interviews].sort(
    (a, b) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  );

  if (loading) {
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
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Back */}

        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-violet-600"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        {/* Heading */}

        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Interviews</h1>

          <p className="mt-1 text-slate-500">
            View your scheduled and completed interviews.
          </p>
        </div>

        {/* Error */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty */}

        {!error && interviews.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <CalendarDays size={40} className="mx-auto mb-3 text-slate-300" />

            <h2 className="font-semibold text-slate-700">
              No interviews scheduled
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Your scheduled interviews will appear here.
            </p>

            <button
              onClick={() => navigate("/application")}
              className="mt-5 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              View Applications
            </button>
          </div>
        )}

        {/* Interviews */}

        <div className="mt-8 space-y-5">
          {sortedInterviews.map((interview) => (
            <div
              key={interview.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:shadow-sm"
            >
              {/* Top */}

              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <BriefcaseBusiness size={19} className="text-violet-600" />

                    <h2 className="text-lg font-bold text-slate-800">
                      {interview.application.job.title}
                    </h2>
                  </div>

                  {interview.round && (
                    <p className="mt-2 text-sm text-slate-500">
                      {interview.round.name}
                    </p>
                  )}
                </div>

                <span
                  className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                    interview.status,
                  )}`}
                >
                  {getStatusIcon(interview.status)}

                  {interview.status.replaceAll("_", " ")}
                </span>
              </div>

              {/* Information */}

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <InfoCard
                  icon={<CalendarDays size={18} />}
                  label="Date"
                  value={new Date(interview.scheduledAt).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                />

                <InfoCard
                  icon={<Clock3 size={18} />}
                  label="Time"
                  value={new Date(interview.scheduledAt).toLocaleTimeString(
                    "en-IN",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                />

                <InfoCard
                  icon={<MapPin size={18} />}
                  label="Location"
                  value={interview.location}
                />

                <InfoCard
                  icon={<Layers3 size={18} />}
                  label="Round"
                  value={interview.round?.name || "Interview Round"}
                />
              </div>

              {/* Interviewer */}

              {interview.interviewer && (
                <div className="mt-6 rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                      <UserRound size={19} />
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">Interviewer</p>

                      <p className="font-semibold text-slate-700">
                        {interview.interviewer.name}
                      </p>

                      <p className="text-xs text-slate-400">
                        {interview.interviewer.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Application */}

              <div className="mt-5 flex justify-end">
                <button
                  onClick={() =>
                    navigate(`/application/${interview.application.id}`)
                  }
                  className="rounded-lg border border-violet-200 px-4 py-2 text-sm font-semibold text-violet-600 transition hover:bg-violet-50"
                >
                  View Application
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoCard = ({ icon, label, value }: InfoCardProps) => {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="mb-2 text-violet-600">{icon}</div>

      <p className="text-xs font-medium text-slate-400">{label}</p>

      <p className="mt-1 text-sm font-semibold text-slate-700">{value}</p>
    </div>
  );
};

export default CanMyInterviews;
