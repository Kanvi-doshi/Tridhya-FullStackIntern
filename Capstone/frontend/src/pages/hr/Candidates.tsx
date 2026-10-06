import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  BriefcaseBusiness,
  Search,
  UserRound,
  ClipboardList,
  UserRoundSearch,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import api from "../../services/api";
import { HRRealtimeContext } from "../../context/RealtimeContext";

interface Candidate {
  id: string;
  name: string;
  email: string;
}

interface Job {
  id: string;
  title: string;
  location: string;
}

interface Application {
  id: string;
  status: string;
  currentRound: number;
  jobMatchScore: string | null;
  overallScore: number | null;
  assessmentScore: number | null;
  appliedAt: string;

  candidate: Candidate;
  job: Job;
}

const Candidates = () => {
  const navigate = useNavigate();
  const hrRevision = useContext(HRRealtimeContext);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    let cancelled = false;
    const fetchCandidates = async () => {
      try {
        const response = await api.get("/application");
        if (!cancelled) {
          setApplications(response.data.applications || []);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError("Unable to refresh candidates.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchCandidates();
    return () => {
      cancelled = true;
    };
  }, [hrRevision]);

  const filteredApplications = applications.filter((application) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      application.candidate?.name?.toLowerCase().includes(searchValue) ||
      application.candidate?.email?.toLowerCase().includes(searchValue) ||
      application.job?.title?.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === "ALL" || application.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "SHORTLISTED":
        return "bg-blue-100 text-blue-700";

      case "INTERVIEWING":
        return "bg-amber-100 text-amber-700";

      case "SELECTED":
        return "bg-emerald-100 text-emerald-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "APPLIED":
        return "bg-violet-100 text-violet-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />

          <p className="mt-4 text-sm text-slate-500">Loading candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-6">
          {/* Header */}
          <button
            onClick={() => navigate("/dashboard")}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
            title="Back to dashboard"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-2xl font-bold">Candidates</h1>

            <p className="mt-1 text-sm ">
              Manage candidates and track their hiring progress.
            </p>
          </div>
        </div>
      </header>

      {/* Filters */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Applications",
              value: applications.length,
              icon: <ClipboardList size={24} />,
            },
            {
              title: "Shortlisted",
              value: applications.filter(
                (item) => item.status === "SHORTLISTED",
              ).length,
              icon: <UserRoundSearch size={24} aria-hidden="true" />,
            },
            {
              title: "Interviewing",
              value: applications.filter(
                (item) => item.status === "INTERVIEWING",
              ).length,
              icon: <Clock3 size={24} aria-hidden="true" />,
            },
            {
              title: "Selected",
              value: applications.filter((item) => item.status === "SELECTED")
                .length,
              icon: <CheckCircle2 size={24} aria-hidden="true" />,
            },
          ].map((stat) => (
            <div
              key={stat.title}
              className=" group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:bg-violet-50 hover:shadow-md "
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-800">
                    {stat.value}
                  </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search candidate, email or job..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 outline-none transition focus:border-violet-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-violet-400"
          >
            <option value="ALL">All Status</option>
            <option value="APPLIED">Applied</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEWING">Interviewing</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Candidates */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {filteredApplications.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white">
            <UserRound size={40} className="mb-3 text-slate-300" />

            <p className="font-semibold text-slate-600">No candidates found</p>

            <p className="mt-1 text-sm text-slate-400">
              Candidate applications will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr className="text-left text-xs font-semibold uppercase text-slate-500">
                    <th className="px-5 py-4">Candidate</th>
                    <th className="px-5 py-4">Job</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Current Round</th>
                    <th className="px-5 py-4">Resume Match</th>
                    <th className="px-5 py-4">Applied</th>
                    <th className="px-5 py-4"></th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredApplications.map((application) => (
                    <tr
                      key={application.id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* Candidate */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-600">
                            {application.candidate?.name
                              ?.charAt(0)
                              .toUpperCase() || "C"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700">
                              {application.candidate?.name}
                            </p>

                            <p className="text-xs text-slate-400">
                              {application.candidate?.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Job */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <BriefcaseBusiness
                            size={16}
                            className="text-slate-400"
                          />

                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {application.job?.title}
                            </p>

                            <p className="text-xs text-slate-400">
                              {application.job?.location}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                            application.status,
                          )}`}
                        >
                          {application.status}
                        </span>
                      </td>

                      {/* Current Round */}

                      <td className="px-5 py-4">
                        {application.currentRound > 0 ? (
                          <span className="text-sm font-medium text-slate-700">
                            Round {application.currentRound}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">
                            Not started
                          </span>
                        )}
                      </td>

                      {/* Resume Match */}

                      <td className="px-5 py-4">
                        {application.jobMatchScore !== null ? (
                          <span className="font-semibold text-violet-600">
                            {Number(application.jobMatchScore).toFixed(0)}%
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>

                      {/* Applied */}

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {new Date(application.appliedAt).toLocaleDateString()}
                      </td>

                      {/* Action */}

                      <td className="px-5 py-4">
                        <button
                          onClick={() =>
                            navigate(`/candidates/${application.id}`)
                          }
                          className="flex items-center gap-1 text-sm font-semibold text-violet-600 transition hover:text-violet-700"
                        >
                          View
                          <ArrowRight size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Candidates;
