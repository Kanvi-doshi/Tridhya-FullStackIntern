import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Sparkles,
  Upload,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/authContext";

interface Job {
  id: string;
  title: string;
  location: string;
  status: string;
}

const ApplyJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/job/${id}`);
        setJob(response.data.job);
      } catch (error: any) {
        setError(error.response?.data?.message || "Failed to load job");
      } finally {
        setPageLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleResume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF and DOCX files are allowed");
      return;
    }

    setError("");
    setResume(file);
  };

  const handleApply = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!resume) {
      setError("Please upload your resume");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();

      formData.append("resume", resume);

      await api.post(`/application/job/${id}/apply`, formData);
      setSuccess(true);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-red-500">{error || "Job not found"}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={32} />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-800">
            Application Submitted!
          </h2>

          <p className="mt-2 text-slate-500">
            Your application for {job.title} has been submitted successfully.
          </p>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 w-full rounded-xl bg-violet-600 py-3 font-semibold text-white hover:bg-violet-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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

            <h1 className="font-bold text-slate-800">SmartHire AI</h1>
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

      <main className="mx-auto max-w-3xl px-6 py-8">
        <button
          onClick={() => navigate(`/job/${id}`)}
          className="mb-6 flex items-center gap-2 text-sm text-slate-500 hover:text-violet-600"
        >
          <ArrowLeft size={17} />
          Back to Job
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <div className="mb-7 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <BriefcaseBusiness size={23} />
            </div>

            <div>
              <p className="text-sm text-slate-400">Applying for</p>

              <h1 className="text-2xl font-bold text-slate-800">{job.title}</h1>

              <p className="mt-1 text-sm text-slate-500">{job.location}</p>
            </div>
          </div>

          <form onSubmit={handleApply}>
            <div>
              <h2 className="font-semibold text-slate-800">Upload Resume</h2>

              <p className="mt-1 text-sm text-slate-500">
                Upload your latest resume in PDF or DOCX format.
              </p>

              <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 px-6 py-10 transition hover:border-violet-400 hover:bg-violet-50/40">
                <Upload size={30} className="mb-3 text-violet-500" />

                <p className="font-medium text-slate-700">
                  Click to upload your resume
                </p>

                <p className="mt-1 text-xs text-slate-400">PDF or DOCX</p>

                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleResume}
                  className="hidden"
                />
              </label>

              {resume && (
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-violet-50 p-4">
                  <FileText size={21} className="text-violet-600" />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-700">
                      {resume.name}
                    </p>

                    <p className="text-xs text-slate-400">
                      {(resume.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !resume}
              className="mt-7 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Submitting Application..." : "Submit Application"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ApplyJob;
