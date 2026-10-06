import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  Eye,
  MapPin,
  Search,
  UserRound,
  Video,
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

  round: {
    id: string;
    name?: string;
    title?: string;
    roundNumber?: number;
    type?: string;
  };

  application: {
    id: string;
    status: string;

    candidate: {
      id: string;
      name: string;
      email: string;
    };

    job: {
      id: string;
      title: string;
      location: string;
    };
  };
}

const InterviewerConductInterviews = () => {
  const navigate = useNavigate();
  const revision = useContext(HRRealtimeContext);

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH INTERVIEWS
  // GET /api/interviewer/interviews
  // ==========================================

  useEffect(() => {
    let cancelled = false;
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        setError("");
        setError("");

        const response = await api.get("/interviewer/interviews");

        if (cancelled) return;
        setInterviews(
          response.data.interviews || response.data.assignments || [],
        );
      } catch (error: any) {
        if (cancelled) return;
        console.error("Failed to load interviews:", error);

        setError(error.response?.data?.message || "Failed to load interviews");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchInterviews();
    return () => { cancelled = true; };
  }, [revision]);

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredInterviews = interviews.filter((interview) => {
    const query = search.toLowerCase().trim();

    const candidateName =
      interview.application?.candidate?.name?.toLowerCase() || "";

    const jobTitle = interview.application?.job?.title?.toLowerCase() || "";

    const location = interview.location?.toLowerCase() || "";

    return (
      candidateName.includes(query) ||
      jobTitle.includes(query) ||
      location.includes(query)
    );
  });

  // ==========================================
  // COUNTS
  // ==========================================

  const scheduledCount = interviews.filter(
    (interview) => interview.status === "SCHEDULED",
  ).length;

  const completedCount = interviews.filter(
    (interview) => interview.status === "COMPLETED",
  ).length;

  // ==========================================
  // LOADING
  // ==========================================

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
      {/* HEADER */}

      <div className="bg-gradient-to-r from-violet-600 to-indigo-600">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-violet-600 transition hover:scale-105"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h1 className="text-xl font-bold text-white">My Interviews</h1>

              <p className="mt-1 text-sm text-violet-100">
                View your assigned candidate interviews
              </p>
            </div>
          </div>

          <Video size={27} className="hidden text-white sm:block" />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* STATISTICS */}

        <div className="grid gap-5 sm:grid-cols-3">
          <StatCard
            title="Total Interviews"
            value={interviews.length}
            icon={<Video size={20} />}
          />

          <StatCard
            title="Scheduled"
            value={scheduledCount}
            icon={<Clock3 size={20} />}
          />

          <StatCard
            title="Completed"
            value={completedCount}
            icon={<UserRound size={20} />}
          />
        </div>

        {/* SEARCH */}

        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search candidate, job or location..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </div>

        {/* INTERVIEWS */}

        <div className="mt-6">
          {filteredInterviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <Video size={38} className="mx-auto text-slate-300" />

              <h3 className="mt-4 font-semibold text-slate-700">
                No interviews found
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                {interviews.length === 0
                  ? "No interviews have been assigned to you yet."
                  : "No interviews match your search."}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {filteredInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  {/* Candidate */}

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-600">
                        {interview.application?.candidate?.name
                          ?.charAt(0)
                          .toUpperCase() || "C"}
                      </div>

                      <div>
                        <h2 className="font-bold text-slate-800">
                          {interview.application?.candidate?.name ||
                            "Candidate"}
                        </h2>

                        <p className="text-sm text-slate-400">
                          {interview.application?.candidate?.email}
                        </p>
                      </div>
                    </div>

                    <StatusBadge status={interview.status} />
                  </div>

                  {/* Job */}

                  <div className="mt-5 flex items-center gap-2 text-sm text-slate-600">
                    <BriefcaseBusiness size={16} className="text-violet-600" />

                    {interview.application?.job?.title}
                  </div>

                  {/* Details */}

                  <div className="mt-4 space-y-3 rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <CalendarDays size={15} />

                      {new Date(interview.scheduledAt).toLocaleDateString(
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

                      {new Date(interview.scheduledAt).toLocaleTimeString(
                        "en-IN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin size={15} />

                      {interview.location}
                    </div>
                  </div>

                  {/* Round */}

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Interview Round
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {interview.round?.name ||
                        interview.round?.title ||
                        `Round ${interview.round?.roundNumber || ""}`}
                    </p>
                  </div>

                  {/* ACTION */}

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <button
                      onClick={() => navigate(`/interview/${interview.id}`)}
                      className="flex items-center gap-2 rounded-lg bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-600 transition hover:bg-violet-100"
                    >
                      <Eye size={16} />
                      View Interview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// ==========================================
// STAT CARD
// ==========================================

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

// ==========================================
// STATUS BADGE
// ==========================================

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
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
      {status}
    </span>
  );
};

export default InterviewerConductInterviews;
