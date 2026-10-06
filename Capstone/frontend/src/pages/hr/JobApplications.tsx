import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Eye,
  Mail,
  Search,
  User,
  Users,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { HRRealtimeContext } from "../../context/RealtimeContext";

interface Application {
  id: string;
  status: string;
  jobMatchScore: string | number | null;
  overallScore: string | number | null;
  currentRound: number;
  appliedAt: string;

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
}

const JobApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const hrRevision = useContext(HRRealtimeContext);
  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!jobId) {
      setError("Job ID is missing");
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetchApplications = async () => {

      try {
        const response = await api.get(`/application/job/${jobId}`);

        if (!cancelled) {
          setApplications(response.data.applications || []);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError("Unable to refresh job applications.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchApplications();
    return () => {
      cancelled = true;
    };
  }, [jobId, hrRevision]);

  const filteredApplications = applications.filter((application) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      application.candidate.name.toLowerCase().includes(query) ||
      application.candidate.email.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "ALL" || application.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />

          <p className="mt-4 text-sm text-slate-500">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-5">
          <button
            onClick={() => navigate(`/job/${jobId}`)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-violet-600"
            title="Back to job"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Job Applications
            </h1>

            <p className="text-sm text-slate-400">
              Review candidates who applied for this position
            </p>
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

        {/* SUMMARY */}

        <div className="mb-6 grid gap-5 sm:grid-cols-3">
          <SummaryCard
            title="Applications"
            value={applications.length}
            icon={<Users size={20} />}
          />

          <SummaryCard
            title="Shortlisted"
            value={
              applications.filter(
                (application) => application.status === "SHORTLISTED",
              ).length
            }
            icon={<User size={20} />}
          />

          <SummaryCard
            title="Selected"
            value={
              applications.filter(
                (application) => application.status === "SELECTED",
              ).length
            }
            icon={<BriefcaseBusiness size={20} />}
          />
        </div>

        {/* SEARCH + FILTER */}

        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search candidate by name or email..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-violet-400"
          >
            <option value="ALL">All Status</option>
            <option value="APPLIED">Applied</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEWING">Interviewing</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* EMPTY */}

        {!error && filteredApplications.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <Users size={38} className="mx-auto text-slate-300" />

            <h3 className="mt-4 font-semibold text-slate-700">
              No applications found
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              {applications.length === 0
                ? "No candidates have applied for this job yet."
                : "No applications match your current search or filter."}
            </p>
          </div>
        )}

        {/* APPLICATIONS */}

        {!error && filteredApplications.length > 0 && (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div
                key={application.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:shadow-sm"
              >
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                  {/* CANDIDATE */}

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-600">
                      {application.candidate.name?.charAt(0).toUpperCase() ||
                        "C"}
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-800">
                        {application.candidate.name}
                      </h2>

                      <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                        <Mail size={14} />

                        {application.candidate.email}
                      </div>

                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                        <CalendarDays size={13} />
                        Applied{" "}
                        {new Date(application.appliedAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SCORES */}

                  <div className="flex flex-wrap items-center gap-6">
                    <Score
                      label="Job Match"
                      value={application.jobMatchScore}
                    />

                    <Score label="Overall" value={application.overallScore} />

                    <div>
                      <p className="mb-1 text-xs text-slate-400">Status</p>

                      <StatusBadge status={application.status} />
                    </div>

                    {/* DETAILS */}

                    <button
                      onClick={() => navigate(`/application/${application.id}`)}
                      className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                    >
                      <Eye size={16} />
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

const SummaryCard = ({ title, value, icon }: SummaryCardProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
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

const Score = ({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) => {
  const score = value === null ? null : Number(value);

  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>

      <p className="mt-1 font-bold text-slate-700">
        {score === null || Number.isNaN(score) ? "N/A" : `${score.toFixed(1)}%`}
      </p>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  let style = "bg-violet-100 text-violet-700";

  if (status === "SHORTLISTED") {
    style = "bg-blue-100 text-blue-700";
  }

  if (status === "INTERVIEWING") {
    style = "bg-amber-100 text-amber-700";
  }

  if (status === "SELECTED") {
    style = "bg-green-100 text-green-700";
  }

  if (status === "REJECTED") {
    style = "bg-red-100 text-red-700";
  }

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${style}`}
    >
      {status}
    </span>
  );
};

export default JobApplications;
