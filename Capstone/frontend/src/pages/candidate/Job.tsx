import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  MapPin,
  Search,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/authContext";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  experienceRequired: string;
  skills: string | null;
  status: string;
  createdAt: string;
}

const Jobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get("/job");
        setJobs(response.data.jobs || []);
      } catch (error: any) {
        setError(error.response?.data?.message || "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div
            onClick={() => navigate("/dashboard")}
            className="flex cursor-pointer items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white">
              <Sparkles size={19} />
            </div>
            <h1 className="text-lg font-bold text-slate-800">SmartHire AI</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-700">
                {user?.name}
              </p>
              <p className="text-xs text-slate-400">Candidate</p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-600">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </nav>

      <button
        onClick={() => navigate("/dashboard")}
        className="ml-4 mt-3 flex items-center gap-2 text-md font-medium text-black-500 transition hover:text-violet-600"
      >
        <ArrowLeft size={17} />
        Back to Dashboard
      </button>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-2">
          <h2 className="text-3xl font-bold text-slate-800">
            Explore Opportunities
          </h2>
          <p className="mt-1 text-slate-500">
            Find a role that matches your skills and experience.
          </p>
        </div>

        <div className="relative mb-4 max-w-xl">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        {loading && <p className="text-slate-500">Loading available jobs...</p>}

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-red-600">{error}</div>
        )}

        {!loading && !error && filteredJobs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <BriefcaseBusiness
              size={35}
              className="mx-auto mb-3 text-slate-300"
            />
            <p className="font-medium text-slate-600">No jobs found</p>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-5 flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <BriefcaseBusiness size={21} />
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                  {job.status}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-800">{job.title}</h3>

              <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                <MapPin size={16} />
                {job.location}
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Experience: {job.experienceRequired}
              </p>

              {job.skills && (
                <p className="mt-2 line-clamp-1 text-sm text-slate-500">
                  Skills: {job.skills}
                </p>
              )}

              <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
                {job.description}
              </p>

              <button
                onClick={() => navigate(`/job/${job.id}`)}
                className="mt-6 w-full rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Jobs;
