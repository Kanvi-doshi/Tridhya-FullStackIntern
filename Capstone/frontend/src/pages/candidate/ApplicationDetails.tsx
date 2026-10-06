import {
  ArrowLeft,
  Award,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  MapPin,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { HRRealtimeContext } from "../../context/RealtimeContext";
import AssessmentRounds from "../../component/candidate/AssessmentRounds";

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

  jobMatchScore: string | null;

  appliedAt: string;
  updatedAt: string;

  job: {
    id: string;
    title: string;
    description: string;
    location: string;
    experienceRequired: string;
    skills: string;
    status: string;
  };
}

const CandidateApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const revision = useContext(HRRealtimeContext);

  const [application, setApplication] = useState<Application | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const handleCancel = async () => {
    if (!application || cancelling) return;
    if (!window.confirm("Cancel and remove this application?")) return;
    try {
      setCancelling(true);
      setCancelError("");
      await api.delete(`/application/${application.id}`);
      navigate("/application", { replace: true });
    } catch (error: any) {
      setCancelError(error.response?.data?.message || "Unable to cancel application");
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const fetchApplication = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/application/my");
        const selectedApplication = response.data.applications.find(
          (application: Application) => application.id === id,
        );

        if (cancelled) return;
        if (!selectedApplication) {
          setError("Application not found");
          return;
        }
        setApplication(selectedApplication);
      } catch (error: any) {
        if (cancelled) return;
        console.error("Failed to fetch application:", error);

        setError(error.response?.data?.message || "Failed to load application");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (!id) return;

    void fetchApplication();
    const handleFocus = () => {
      void fetchApplication();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", handleFocus);
    };
  }, [id, revision]);

  const getStatusStyle = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SELECTED":
        return <CheckCircle2 size={18} />;

      case "REJECTED":
        return <XCircle size={18} />;

      case "INTERVIEWING":
        return <Clock3 size={18} />;

      default:
        return <FileText size={18} />;
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
          <XCircle size={36} className="mx-auto text-red-500" />

          <h2 className="mt-4 text-lg font-bold text-slate-800">
            Unable to load application
          </h2>

          <p className="mt-2 text-sm text-slate-500">{error}</p>

          <button
            onClick={() => navigate("/application")}
            className="mt-6 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  const matchScore = Number(application.jobMatchScore || 0);

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

          <button
            onClick={() => navigate("/application")}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Applications
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-800">
                  {application.job.title}
                </h1>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                    application.status,
                  )}`}
                >
                  {getStatusIcon(application.status)}

                  {application.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} />
                  {application.job.location}
                </span>

                <span className="flex items-center gap-1.5">
                  <BriefcaseBusiness size={15} />
                  {application.job.experienceRequired}
                </span>

                <span className="flex items-center gap-1.5">
                  <CalendarDays size={15} />
                  Applied{" "}
                  {new Date(application.appliedAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
            {application.status === "APPLIED" && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Cancel Application"}
              </button>
            )}
            <button
              onClick={() => navigate(`/job/${application.job.id}`)}
              className="rounded-lg border border-violet-200 px-4 py-2 text-sm font-semibold text-violet-600 transition hover:bg-violet-50"
            >
              View Job
            </button>
            </div>
          </div>
          {cancelError && <p role="alert" className="mt-4 text-sm text-red-600">{cancelError}</p>}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left */}

          <div className="space-y-6 lg:col-span-2">
            <Section
              title="Application Progress"
              description="Current progress of your application"
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <SmallInfoCard
                  label="Status"
                  value={application.status}
                  icon={<FileText size={19} />}
                />

                <SmallInfoCard
                  label="Current Round"
                  value={`Round ${application.currentRound}`}
                  icon={<Clock3 size={19} />}
                />

                <SmallInfoCard
                  label="Job Status"
                  value={application.job.status}
                  icon={<BriefcaseBusiness size={19} />}
                />
              </div>
            </Section>

            <AssessmentRounds
              jobId={application.job.id}
              applicationStatus={application.status}
            />

            <Section
              title="Resume Analysis"
              description="AI analysis generated from your submitted resume"
            >
              {application.resumeSummary ? (
                <div className="rounded-xl bg-violet-50 p-5">
                  <div className="mb-3 flex items-center gap-2 text-violet-700">
                    <Sparkles size={18} />

                    <p className="font-semibold">AI Resume Summary</p>
                  </div>

                  <p className="text-sm leading-6 text-slate-600">
                    {application.resumeSummary}
                  </p>
                </div>
              ) : (
                <EmptyText text="Resume analysis is not available yet." />
              )}

              {application.resumeSkills &&
                application.resumeSkills.length > 0 && (
                  <div className="mt-6">
                    <h4 className="mb-3 text-sm font-semibold text-slate-700">
                      Detected Skills
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {application.resumeSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {application.resumeStrengths &&
                application.resumeStrengths.length > 0 && (
                  <div className="mt-6">
                    <h4 className="mb-3 text-sm font-semibold text-slate-700">
                      Strengths
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {application.resumeStrengths.map((strength) => (
                        <span
                          key={strength}
                          className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700"
                        >
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {application.resumeMissingSkills &&
                application.resumeMissingSkills.length > 0 && (
                  <div className="mt-6">
                    <h4 className="mb-3 text-sm font-semibold text-slate-700">
                      Skills Gap
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {application.resumeMissingSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </Section>

            {(application.resumeExperience || application.resumeEducation) && (
              <Section
                title="Resume Details"
                description="Extracted education and experience information"
              >
                {application.resumeExperience && (
                  <DetailBlock
                    title="Experience"
                    value={application.resumeExperience}
                    icon={<BriefcaseBusiness size={19} />}
                  />
                )}

                {application.resumeEducation && (
                  <DetailBlock
                    title="Education"
                    value={application.resumeEducation}
                    icon={<GraduationCap size={19} />}
                  />
                )}
              </Section>
            )}

            <Section title="Job Details" description="Position you applied for">
              <p className="text-sm leading-7 text-slate-600">
                {application.job.description}
              </p>

              <div className="mt-5">
                <p className="mb-2 text-sm font-semibold text-slate-700">
                  Required Skills
                </p>

                <p className="text-sm text-slate-500">
                  {application.job.skills}
                </p>
              </div>
            </Section>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-2">
                <Target size={20} className="text-violet-600" />

                <h3 className="font-bold text-slate-800">Job Match</h3>
              </div>

              <div className="mt-6 text-center">
                <p className="text-4xl font-bold text-violet-600">
                  {matchScore.toFixed(0)}%
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Resume compatibility score
                </p>
              </div>

              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-violet-600"
                  style={{
                    width: `${Math.min(Math.max(matchScore, 0), 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-2">
                <Award size={20} className="text-violet-600" />

                <h3 className="font-bold text-slate-800">Overall Score</h3>
              </div>

              {application.overallScore !== null ? (
                <>
                  <p className="mt-6 text-center text-4xl font-bold text-slate-800">
                    {Number(application.overallScore).toFixed(1)}
                  </p>

                  <p className="mt-1 text-center text-xs text-slate-400">
                    Overall candidate evaluation
                  </p>
                </>
              ) : (
                <p className="mt-6 text-center text-sm text-slate-400">
                  Not evaluated yet
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-violet-600" />

                <h3 className="font-bold text-slate-800">Submitted Resume</h3>
              </div>

              {application.resumeOriginalName ? (
                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="break-all text-sm font-medium text-slate-700">
                    {application.resumeOriginalName}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Submitted with application
                  </p>
                </div>
              ) : (
                <p className="mt-5 text-sm text-slate-400">
                  Resume information unavailable.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Application ID
              </p>

              <p className="mt-2 break-all text-xs text-slate-500">
                {application.id}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

interface SectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const Section = ({ title, description, children }: SectionProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-5">
        <h3 className="font-bold text-slate-800">{title}</h3>

        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>

      {children}
    </div>
  );
};

interface SmallInfoCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

const SmallInfoCard = ({ label, value, icon }: SmallInfoCardProps) => {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
        {icon}
      </div>

      <p className="mt-3 text-xs text-slate-400">{label}</p>

      <p className="mt-1 text-sm font-semibold text-slate-700">{value}</p>
    </div>
  );
};

interface DetailBlockProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const DetailBlock = ({ title, value, icon }: DetailBlockProps) => {
  return (
    <div className="mb-4 rounded-xl bg-slate-50 p-5 last:mb-0">
      <div className="flex items-center gap-2 text-violet-600">
        {icon}

        <h4 className="font-semibold">{title}</h4>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">{value}</p>
    </div>
  );
};

const EmptyText = ({ text }: { text: string }) => {
  return (
    <div className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-400">
      {text}
    </div>
  );
};

export default CandidateApplicationDetails;
