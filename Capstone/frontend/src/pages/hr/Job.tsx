import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Edit3,
  Eye,
  MapPin,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  experienceRequired: string;
  skills: string;
  status: string;
  createdAt: string;
  updatedAt: string;

  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

const HRJobs = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/job");

      setJobs(response.data.jobs || []);
    } catch (error: any) {
      console.error("Failed to fetch jobs:", error);

      setError(error.response?.data?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      await api.delete(`/job/${id}`);

      setJobs((previousJobs) => previousJobs.filter((job) => job.id !== id));
    } catch (error: any) {
      console.error("Failed to delete job:", error);

      alert(error.response?.data?.message || "Failed to delete job");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const query = search.toLowerCase().trim();

    const matchesSearch =
      job.title.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query) ||
      job.skills.toLowerCase().includes(query);

    const matchesStatus = statusFilter === "ALL" || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const openJobs = jobs.filter((job) => job.status === "OPEN").length;
  const closedJobs = jobs.filter((job) => job.status === "CLOSED").length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />

          <p className="mt-4 text-sm text-slate-500">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
              title="Back to dashboard"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-white">Job Management</h1>

              <p className="mt-1 text-sm text-violet-100">
                Create and manage available positions
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/job/new")}
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-violet-600 shadow-sm transition hover:bg-violet-50"
          >
            <Plus size={17} />
            Create Job
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-3">
          <StatCard
            title="Total Jobs"
            value={jobs.length}
            icon={<BriefcaseBusiness size={20} />}
          />

          <StatCard
            title="Open Jobs"
            value={openJobs}
            icon={<Users size={20} />}
          />

          <StatCard
            title="Closed Jobs"
            value={closedJobs}
            icon={<CalendarDays size={20} />}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, location or skill..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="min-w-40 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-600 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>

        {/* Jobs */}

        <div className="mt-6">
          {filteredJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <BriefcaseBusiness size={36} className="mx-auto text-slate-300" />

              <h3 className="mt-4 font-semibold text-slate-700">
                No jobs found
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                {jobs.length === 0
                  ? "Create your first job to start receiving applications."
                  : "No jobs match your current search or filter."}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-800">
                          {job.title}
                        </h2>

                        <StatusBadge status={job.status} />
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin size={13} />
                          {job.location}
                        </span>

                        <span className="flex items-center gap-1">
                          <BriefcaseBusiness size={13} />
                          {job.experienceRequired}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
                    {job.description}
                  </p>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Skills
                    </p>

                    <p className="mt-1 line-clamp-1 text-sm text-slate-600">
                      {job.skills}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-1 text-xs text-slate-400">
                    <CalendarDays size={13} />
                    Created{" "}
                    {new Date(job.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                    <button
                      onClick={() => navigate(`/job/${job.id}`)}
                      className="flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-600 transition hover:bg-violet-100"
                    >
                      <Eye size={15} />
                      View
                    </button>

                    <button
                      onClick={() => navigate(`/job/${job.id}/edit`)}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                    >
                      <Edit3 size={15} />
                      Edit
                    </button>

                    <button
                      onClick={() => navigate(`/job/${job.id}/application`)}
                      className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
                    >
                      <Users size={15} />
                      Applications
                    </button>

                    <button
                      onClick={() => handleDelete(job.id, job.title)}
                      disabled={deletingId === job.id}
                      className="ml-auto flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={15} />

                      {deletingId === job.id ? "Deleting..." : "Delete"}
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

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, icon }: StatCardProps) => {
  return (
    <div className=" group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50  hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-slate-800">{value}</p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition-colors group-hover:bg-violet-600 group-hover:text-white">
          {icon}
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const style =
    status === "OPEN"
      ? "bg-green-100 text-green-700"
      : "bg-slate-100 text-slate-600";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>
      {status}
    </span>
  );
};

export default HRJobs;
