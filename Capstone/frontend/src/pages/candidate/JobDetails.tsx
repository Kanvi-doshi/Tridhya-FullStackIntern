import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, MapPin, Sparkles } from "lucide-react";
import { useAuth } from "../../context/authContext";
import {
  getErrorMessage,
  useJob,
  useMyApplications,
} from "../../component/hooks/queries";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  experienceRequired: string;
  skills: string | null;
  status: string;
}

const CanJobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: job, isLoading: jobLoading, error: jobError } = useJob<Job>(id);
  const { data: applications = [], isLoading: applicationsLoading } =
    useMyApplications<{ job?: { id: string } }>();
  const loading = jobLoading || applicationsLoading;
  const alreadyApplied =
    !!job && applications.some((application) => application.job?.id === job.id);
  const error = jobError ? getErrorMessage(jobError, "Failed to load job") : "";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading job...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-red-500">{error || "Job not found"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex cursor-pointer items-center gap-2">
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
        onClick={() => navigate("/job")}
        className="ml-5 mt-3 flex items-center gap-2 text-sm font-medium text-black-500 hover:text-violet-600"
      >
        <ArrowLeft size={17} />
        Back to Job
      </button>
      <main className="mx-auto max-w-3xl px-2">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-5 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-9 items-center justify-center rounded-xl bg-white/15">
                <BriefcaseBusiness size={20} />
              </div>

              <h1 className="text-3xl font-bold">{job.title}</h1>
            </div>

            <div className="mt-1 px-3 flex items-center gap-5 text-violet-100">
              <MapPin size={17} />
              {job.location}
            </div>
          </div>

          <div className="p-4">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase text-slate-400">
                  Experience Required
                </p>
                <p className="mt-1 font-semibold text-slate-700">
                  {job.experienceRequired}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase text-slate-400">
                  Job Status
                </p>
                <p className="mt-1 font-semibold text-emerald-600">
                  {job.status}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <h2 className="text-lg font-bold text-slate-800">
                Job Description
              </h2>

              <p className="mt-2 whitespace-pre-line leading-7 text-slate-600">
                {job.description}
              </p>
            </div>

            <div className="mt-3">
              <h2 className="text-lg font-bold text-slate-800">
                Required Skills
              </h2>

              <p className="mt-2 text-slate-600">
                {job.skills || "No specific skills mentioned"}
              </p>
            </div>

            <div className="mt-1 border-slate-100 pt-6">
              {alreadyApplied ? (
                <button
                  disabled
                  className="cursor-not-allowed rounded-xl bg-green-100 px-7 py-3 font-semibold text-green-700"
                >
                  Already Applied
                </button>
              ) :  job.status === "OPEN" ? (
                <button
                  onClick={() => navigate(`/job/${job.id}/apply`)}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 py-3 font-semibold text-white shadow-md hover:opacity-90"
                >
                  Apply Now
                </button>
              ) : (
                <button
                  disabled
                  className="rounded-xl bg-slate-200 px-7 py-3 font-semibold text-slate-500"
                >
                  Applications Closed
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CanJobDetails;
