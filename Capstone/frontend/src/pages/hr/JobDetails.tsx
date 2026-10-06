import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Edit3,
  MapPin,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  experienceRequired: string;
  skills: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;

  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

const HRJobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) {
        setError("Job ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/job/${id}`);

        setJob(response.data.job);
      } catch (error: any) {
        console.error("Failed to load job:", error);

        setError(error.response?.data?.message || "Failed to load job");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleDelete = async () => {
    if (!job) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${job.title}"?`,
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await api.delete(`/job/${job.id}`);

      navigate("/job", {
        replace: true,
      });
    } catch (error: any) {
      console.error("Failed to delete job:", error);

      alert(error.response?.data?.message || "Failed to delete job");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />

          <p className="mt-4 text-sm text-slate-500">Loading job...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center">
          <BriefcaseBusiness size={40} className="mx-auto text-red-400" />

          <h2 className="mt-4 text-lg font-bold text-slate-800">
            Unable to load job
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error || "Job not found"}
          </p>

          <button
            onClick={() => navigate("/job")}
            className="mt-6 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const skills =
    job.skills
      ?.split(",")
      .map((skill) => skill.trim())
      .filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/job")}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h1 className="text-2xl font-bold ">Job Details</h1>

              <p className="text-sm">View and manage this position</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/job/${job.id}/edit`)}
              className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
            >
              <Edit3 size={16} />
              Edit
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={16} />

              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <BriefcaseBusiness size={23} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-800">
                    {job.title}
                  </h2>

                  <StatusBadge status={job.status} />
                </div>

                <div className="mt-3 flex flex-wrap gap-5 text-sm text-slate-500">
                  <span className="flex items-center gap-2">
                    <MapPin size={16} />
                    {job.location}
                  </span>

                  <span className="flex items-center gap-2">
                    <BriefcaseBusiness size={16} />
                    {job.experienceRequired}
                  </span>

                  <span className="flex items-center gap-2">
                    <CalendarDays size={16} />

                    {new Date(job.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-7">
            <h3 className="font-bold text-slate-800">Job Description</h3>

            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-500">
              {job.description}
            </p>
          </div>

          <div className="mt-7 border-t border-slate-100 pt-7">
            <h3 className="font-bold text-slate-800">Required Skills</h3>

            {skills.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-400">
                No skills specified.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <button
            onClick={() => navigate(`/job/${job.id}/application`)}
            className="group rounded-2xl border border-slate-200 bg-white p-6 text-left transition hover:border-violet-200 hover:shadow-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <Users size={20} />
            </div>

            <h3 className="mt-4 font-bold text-slate-800">View Applications</h3>

            <p className="mt-1 text-sm text-slate-400">
              Review candidates who applied for this position.
            </p>
          </button>

          <button
            onClick={() => navigate(`/job/${job.id}/edit`)}
            className="group rounded-2xl border border-slate-200 bg-white p-6 text-left transition hover:border-violet-200 hover:shadow-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Edit3 size={20} />
            </div>

            <h3 className="mt-4 font-bold text-slate-800">Edit Job</h3>

            <p className="mt-1 text-sm text-slate-400">
              Update job information, requirements or status.
            </p>
          </button>
        </div>

        {job.createdBy && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Created By
            </p>

            <p className="mt-2 font-semibold text-slate-700">
              {job.createdBy.name}
            </p>

            <p className="mt-1 text-sm text-slate-400">{job.createdBy.email}</p>
          </div>
        )}
      </main>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const style =
    status === "OPEN"
      ? "bg-green-100 text-green-700"
      : "bg-slate-100 text-slate-600";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
      {status}
    </span>
  );
};

export default HRJobDetails;
