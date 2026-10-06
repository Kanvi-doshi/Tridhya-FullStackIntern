import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Sparkles,
  Target,
  User,
  XCircle,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import ApplicationStatusSelect from "../../component/hr/ApplicationStatusSelect";
import { HRRealtimeContext } from "../../context/RealtimeContext";

interface Candidate {
  id: string;
  name: string;
  email: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  experienceRequired: string;
  skills: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Application {
  id: string;
  status: string;

  overallScore: number | null;
  currentRound: number;

  resumeOriginalName: string | null;
  resumeSummary: string | null;
  resumeSkills: string[] | null;
  resumeExperience: string | null;
  resumeEducation: string | null;
  resumeStrengths: string[] | null;
  resumeMissingSkills: string[] | null;

  jobMatchScore: string | number | null;

  aiCandidateSummary: string | null;
  aiRecommendation: string | null;
  aiStrengths: string[] | null;
  aiConcerns: string[] | null;

  appliedAt: string;
  updatedAt: string;

  candidate: Candidate;
  job: Job;
}

const HRApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const hrRevision = useContext(HRRealtimeContext);
  const [application, setApplication] = useState<Application | null>(null);

  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Application ID is missing");
      setLoading(false);
      return;
    }
    let cancelled = false;

    const fetchApplication = async () => {
      try {
        const response = await api.get(`/application/${id}`);
        if (!cancelled) {
          setApplication(response.data.application);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError("Unable to refresh application details.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchApplication();

    return () => {
      cancelled = true;
    };
  }, [id, hrRevision]);

  const handleStatusChange = async (newStatus: string) => {
    if (!application) return;

    try {
      setUpdatingStatus(true);

      const response = await api.patch(
        `/application/${application.id}/status`,
        {
          status: newStatus,
        },
      );

      setApplication((previous) =>
        previous
          ? {
              ...previous,
              status: response.data.application?.status || newStatus,
            }
          : previous,
      );
    } catch (error: any) {
      console.error("Failed to update status:", error);

      alert(
        error.response?.data?.message || "Failed to update application status",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleViewResume = async () => {
    if (!application) return;

    try {
      const response = await api.get(`/application/${application.id}/resume`, {
        responseType: "blob",
      });

      const fileURL = URL.createObjectURL(response.data);

      window.open(fileURL, "_blank");

      setTimeout(() => {
        URL.revokeObjectURL(fileURL);
      }, 60000);
    } catch (error: any) {
      console.error("Failed to view resume:", error);

      alert(error.response?.data?.message || "Failed to open resume");
    }
  };

  const handleDownloadResume = async () => {
    if (!application) return;

    try {
      const response = await api.get(
        `/application/${application.id}/resume?download=true`,
        {
          responseType: "blob",
        },
      );

      const fileURL = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = fileURL;
      link.download =
        application.resumeOriginalName ||
        `${application.candidate.name}-resume.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileURL);
    } catch (error: any) {
      console.error("Failed to download resume:", error);

      alert(error.response?.data?.message || "Failed to download resume");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />

          <p className="mt-4 text-sm text-slate-500">Loading application...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center">
          <XCircle size={40} className="mx-auto text-red-400" />

          <h2 className="mt-4 text-lg font-bold text-slate-800">
            Unable to load application
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error || "Application not found"}
          </p>

          <button
            onClick={() => navigate("/application")}
            className="mt-6 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  const jobMatchScore =
    application.jobMatchScore !== null
      ? Number(application.jobMatchScore)
      : null;

  const overallScore =
    application.overallScore !== null ? Number(application.overallScore) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/application")}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-violet-600"
              title="Back to applications"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Application Details
              </h1>

              <p className="text-sm text-slate-400">
                Review candidate information and evaluation
              </p>
            </div>
          </div>

          <StatusBadge status={application.status} />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* CANDIDATE HEADER */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xl font-bold text-violet-600">
                {application.candidate.name?.charAt(0).toUpperCase() || "C"}
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {application.candidate.name}
                </h2>

                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <Mail size={15} />

                  {application.candidate.email}
                </div>

                <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                  <CalendarDays size={14} />
                  Applied{" "}
                  {new Date(application.appliedAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>

            {/* STATUS UPDATE */}

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Application Status
              </p>

              <ApplicationStatusSelect
                applicationId={application.id}
                jobId={application.job.id}
                status={application.status}
                updating={updatingStatus}
                onChange={(status) => {
                  void handleStatusChange(status);
                }}
              />

              {updatingStatus && (
                <p className="mt-2 text-xs text-violet-600">Updating...</p>
              )}
            </div>
          </div>
        </div>

        {/* JOB + SCORES */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* JOB */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <BriefcaseBusiness size={19} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Applied Position
                </p>

                <h3 className="font-bold text-slate-800">
                  {application.job.title}
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap gap-5 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <MapPin size={16} />

                {application.job.location}
              </span>

              <span className="flex items-center gap-2">
                <BriefcaseBusiness size={16} />

                {application.job.experienceRequired}
              </span>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-500">
              {application.job.description}
            </p>

            {application.job.skills && (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Required Skills
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  {application.job.skills}
                </p>
              </div>
            )}
          </div>

          {/* SCORES */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-5 flex items-center gap-2">
              <Target size={20} className="text-violet-600" />
              <h3 className="font-bold text-slate-800">Evaluation Scores</h3>
            </div>
            <ScoreItem title="Job Match Score" value={jobMatchScore} />
            <ScoreItem title="Overall Score" value={overallScore} />
            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400">Current Round</p>
              <p className="mt-1 text-lg font-bold text-slate-700">
                {application.currentRound}
              </p>
            </div>
          </div>
        </div>

        {/* RESUME */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FileText size={19} />
              </div>

              <div>
                <h3 className="font-bold text-slate-800">Candidate Resume</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {application.resumeOriginalName || "Uploaded resume"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleViewResume}
                className="flex items-center gap-2 rounded-lg bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-600 transition hover:bg-violet-100"
              >
                <FileText size={16} />
                View Resume
              </button>

              <button
                onClick={handleDownloadResume}
                className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                <Download size={16} />
                Download
              </button>
            </div>
          </div>
        </div>

        {/* RESUME AI ANALYSIS */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <Sparkles size={19} />
            </div>

            <div>
              <h3 className="font-bold text-slate-800">Resume Analysis</h3>
              <p className="text-sm text-slate-400">
                AI-generated resume insights
              </p>
            </div>
          </div>

          {application.resumeSummary ? (
            <InfoSection title="Summary" content={application.resumeSummary} />
          ) : (
            <EmptyText text="Resume summary not available." />
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <ListSection
              title="Detected Skills"
              values={application.resumeSkills}
              type="normal"
            />
            <ListSection
              title="Strengths"
              values={application.resumeStrengths}
              type="positive"
            />
            <ListSection
              title="Missing Skills"
              values={application.resumeMissingSkills}
              type="negative"
            />
            <div className="rounded-xl bg-slate-50 p-5">
              <div className="mb-3 flex items-center gap-2">
                <GraduationCap size={17} className="text-violet-600" />
                <h4 className="text-sm font-semibold text-slate-700">
                  Education
                </h4>
              </div>

              <p className="text-sm leading-6 text-slate-500">
                {application.resumeEducation ||
                  "Education information not available."}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <User size={17} className="text-violet-600" />

              <h4 className="text-sm font-semibold text-slate-700">
                Experience
              </h4>
            </div>

            <p className="text-sm leading-6 text-slate-500">
              {application.resumeExperience ||
                "Experience information not available."}
            </p>
          </div>
        </div>

        {/* FINAL AI EVALUATION */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <Sparkles size={19} />
            </div>

            <div>
              <h3 className="font-bold text-slate-800">Candidate Evaluation</h3>

              <p className="text-sm text-slate-400">
                Final AI candidate analysis
              </p>
            </div>
          </div>

          {application.aiCandidateSummary ? (
            <InfoSection
              title="Candidate Summary"
              content={application.aiCandidateSummary}
            />
          ) : (
            <EmptyText text="Final candidate evaluation has not been generated yet." />
          )}

          {application.aiRecommendation && (
            <div className="mt-5 rounded-xl border border-violet-100 bg-violet-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-500">
                AI Recommendation
              </p>

              <p className="mt-2 font-semibold text-violet-700">
                {application.aiRecommendation}
              </p>
            </div>
          )}

          {(application.aiStrengths?.length ||
            application.aiConcerns?.length) && (
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <ListSection
                title="AI Strengths"
                values={application.aiStrengths}
                type="positive"
              />

              <ListSection
                title="AI Concerns"
                values={application.aiConcerns}
                type="negative"
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const getStyle = () => {
    switch (status) {
      case "SELECTED":
        return "bg-green-100 text-green-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "SHORTLISTED":
        return "bg-blue-100 text-blue-700";

      case "INTERVIEWING":
        return "bg-amber-100 text-amber-700";

      default:
        return "bg-violet-100 text-violet-700";
    }
  };

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStyle()}`}
    >
      {status}
    </span>
  );
};

const ScoreItem = ({
  title,
  value,
}: {
  title: string;
  value: number | null;
}) => {
  if (value === null || Number.isNaN(value)) {
    return (
      <div className="mb-5 last:mb-0">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">{title}</p>

          <span className="text-sm font-semibold text-slate-400">N/A</span>
        </div>

        <div className="mt-2 h-2 rounded-full bg-slate-100" />
      </div>
    );
  }

  const safeValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>

        <span className="font-bold text-violet-600">
          {safeValue.toFixed(1)}%
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-violet-600"
          style={{
            width: `${safeValue}%`,
          }}
        />
      </div>
    </div>
  );
};

const InfoSection = ({
  title,
  content,
}: {
  title: string;
  content: string;
}) => {
  return (
    <div className="rounded-xl bg-slate-50 p-5">
      <h4 className="text-sm font-semibold text-slate-700">{title}</h4>

      <p className="mt-2 text-sm leading-6 text-slate-500">{content}</p>
    </div>
  );
};

interface ListSectionProps {
  title: string;
  values: string[] | null;
  type: "normal" | "positive" | "negative";
}

const ListSection = ({ title, values, type }: ListSectionProps) => {
  const icon =
    type === "positive" ? (
      <CheckCircle2 size={16} className="text-green-500" />
    ) : type === "negative" ? (
      <XCircle size={16} className="text-red-400" />
    ) : (
      <CheckCircle2 size={16} className="text-violet-500" />
    );

  return (
    <div className="rounded-xl bg-slate-50 p-5">
      <h4 className="text-sm font-semibold text-slate-700">{title}</h4>

      {!values || values.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">No information available.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {values.map((value, index) => (
            <div key={`${value}-${index}`} className="flex items-start gap-2">
              <div className="mt-0.5 shrink-0">{icon}</div>

              <p className="text-sm text-slate-500">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const EmptyText = ({ text }: { text: string }) => {
  return (
    <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-400">
      {text}
    </div>
  );
};

export default HRApplicationDetails;
