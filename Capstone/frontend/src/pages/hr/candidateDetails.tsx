import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Brain,
  CheckCircle2,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Sparkles,
  Target,
  UserRound,
  XCircle,
} from "lucide-react";
import api from "../../services/api";
import CandidateAssessmentReview from "../../component/hr/CandidateAssessmentReview";
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
  skills: string;
  status: string;
}

interface Application {
  id: string;
  status: string;
  currentRound: number;
  overallScore: number | null;
  assessmentScore: number | null;
  jobMatchScore: string | null;
  resumeOriginalName: string | null;
  resumeSummary: string | null;
  resumeSkills: string[] | null;
  resumeExperience: string | null;
  resumeEducation: string | null;
  resumeStrengths: string[] | null;
  resumeMissingSkills: string[] | null;
  aiCandidateSummary: string | null;
  aiRecommendation: string | null;
  aiStrengths: string[] | null;
  aiConcerns: string[] | null;
  appliedAt: string;
  updatedAt: string;
  candidate: Candidate;
  job: Job;
}

interface InterviewFeedback {
  id: string;
  technicalRating: number | string;
  communicationRating: number | string;
  problemSolvingRating: number | string;
  overallRating: number | string;
  recommendation: string;
  strengths: string | null;
  weaknesses: string | null;
  comments: string | null;
  interviewer: {
    name: string;
  };
  assignment: {
    round: {
      title: string;
    };
  };
}

const CandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const hrRevision = useContext(HRRealtimeContext);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<InterviewFeedback[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackError, setFeedbackError] = useState("");
  const [action, setAction] = useState<"score" | "ai" | "report" | "assessmentReport" | null>(null);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const fetchCandidate = async () => {
      try {
        const response = await api.get(`/application/${id}`);

        if (!cancelled) {
          setApplication(response.data.application);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load candidate details.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchCandidate();

    return () => {
      cancelled = true;
    };
  }, [id, hrRevision]);

  useEffect(() => {
    let cancelled = false;

    const loadFeedback = async () => {
      setFeedbackError("");
      try {
        const response = await api.get(`/interview-feedback/application/${id}`);
        if (!cancelled) {
          setFeedback(response.data.feedback || []);
        }
      } catch {
        if (!cancelled) {
          setFeedbackError(
            "Unable to load interview feedback. Reload the page.",
          );
        }
      } finally {
        if (!cancelled) setFeedbackLoading(false);
      }
    };
    if (id) void loadFeedback();
    return () => {
      cancelled = true;
    };
  }, [id, hrRevision]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "APPLIED":
        return "bg-violet-100 text-violet-700";
      case "SHORTLISTED":
        return "bg-blue-100 text-blue-700";
      case "INTERVIEWING":
        return "bg-amber-100 text-amber-700";
      case "SELECTED":
        return "bg-emerald-100 text-emerald-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };
  const refreshApplicationStats = async () => {
    if (!id) return;

    try {
      const response = await api.get(`/application/${id}`);
      setApplication(response.data.application);
    } catch {
      setError(
        "Evaluation was saved, but candidate details could not refresh. Reload the page.",
      );
    }
  };

  const handleEvaluationAction = async (type: "score" | "ai" | "report" | "assessmentReport") => {
    if (!id || action) return;

    setAction(type);
    setActionMessage("");

    try {
      if (type === "report" || type === "assessmentReport") {
        const response = await api.get(`/reports/candidate/${id}`, {
          params: { stage: type === "assessmentReport" ? "assessment" : "final" },
          responseType: "blob",
        });

        const url = URL.createObjectURL(response.data);
        const link = document.createElement("a");

        link.href = url;
        link.download = `candidate-${id}-${type === "assessmentReport" ? "assessment" : "final"}-report.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        setActionMessage("Report downloaded.");
      } else {
        await api.post(
          type === "score"
            ? `/evaluation/application/${id}/calculate`
            : `/candidate-ai/application/${id}/generate`,
        );

        setActionMessage(
          type === "score"
            ? "Final score calculated."
            : "AI summary generated.",
        );
        await refreshApplicationStats();
      }
    } catch (error: unknown) {
      let message = "Unable to complete this action.";

      if (axios.isAxiosError(error)) {
        const data = error.response?.data;

        if (data instanceof Blob) {
          try {
            const parsed = JSON.parse(await data.text());
            message = parsed.message || message;
          } catch {
            setError(
              "Evaluation action, but candidate details could not refresh. Reload the page.",
            );
          }
        } else {
          message = data?.message || error.message;
        }
      }
      setActionMessage(message);
    } finally {
      setAction(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          <p className="mt-4 text-sm text-slate-500">Loading candidate...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
        <p className="text-red-500">{error || "Candidate not found"}</p>
        <button
          onClick={() => navigate("/candidates")}
          className="mt-4 text-sm font-semibold text-violet-600"
        >
          Back to Candidates
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Back */}
        <button
          onClick={() => navigate("/candidates")}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-violet-600"
        >
          <ArrowLeft size={17} />
          Back to Candidates
        </button>

        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-7 text-white">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl font-bold">
                {application.candidate?.name?.charAt(0).toUpperCase() || "C"}
              </div>

              <div>
                <p className="text-sm text-violet-100">Candidate</p>

                <h1 className="text-2xl font-bold">
                  {application.candidate?.name}
                </h1>

                <div className="mt-1 flex items-center gap-2 text-sm text-violet-100">
                  <Mail size={14} />

                  {application.candidate?.email}
                </div>
              </div>
            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-xs font-bold ${getStatusStyle(
                application.status,
              )}`}
            >
              {application.status}
            </span>
          </div>
        </div>

        {/* Quick information */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard
            title="Current Round"
            value={
              application.currentRound > 0
                ? `Round ${application.currentRound}`
                : "Not Started"
            }
            icon={<UserRound size={20} />}
          />

          <InfoCard
            title="Resume Match"
            value={
              application.jobMatchScore !== null
                ? `${Number(application.jobMatchScore).toFixed(0)}%`
                : "Not Available"
            }
            icon={<Target size={20} />}
          />

          <InfoCard
            title="Assessment Score"
            value={
              application.assessmentScore != null
                ? `${Number(application.assessmentScore).toFixed(1)}%`
                : "Not Evaluated"
            }
            icon={<CheckCircle2 size={20} />}
          />

          <InfoCard
            title="Applied"
            value={new Date(application.appliedAt).toLocaleDateString()}
            icon={<BriefcaseBusiness size={20} />}
          />
        </div>

        {/* Job */}
        <Section title="Applied Job">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <BriefcaseBusiness size={21} />
            </div>

            <div>
              <h3 className="font-bold text-slate-800">
                {application.job?.title}
              </h3>
              <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <MapPin size={14} />
                {application.job?.location}
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {application.job?.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <SmallInfo
                  label="Experience"
                  value={application.job?.experienceRequired}
                />
                <SmallInfo
                  label="Required Skills"
                  value={application.job?.skills || "Not specified"}
                />
              </div>
            </div>
          </div>
        </Section>

        {/* Resume Analysis */}
        <Section title="Resume Analysis">
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Summary */}

            <div className="rounded-xl bg-slate-50 p-5">
              <div className="mb-3 flex items-center gap-2">
                <Brain size={18} className="text-violet-600" />

                <h3 className="font-semibold text-slate-700">
                  AI Resume Summary
                </h3>
              </div>

              <p className="text-sm leading-6 text-slate-600">
                {application.resumeSummary || "Resume summary not available."}
              </p>
            </div>

            {/* Experience */}
            <div className="rounded-xl bg-slate-50 p-5">
              <div className="mb-3 flex items-center gap-2">
                <BriefcaseBusiness size={18} className="text-violet-600" />

                <h3 className="font-semibold text-slate-700">Experience</h3>
              </div>

              <p className="text-sm leading-6 text-slate-600">
                {application.resumeExperience ||
                  "Experience information not available."}
              </p>
            </div>

            {/* Education */}
            <div className="rounded-xl bg-slate-50 p-5">
              <div className="mb-3 flex items-center gap-2">
                <GraduationCap size={18} className="text-violet-600" />

                <h3 className="font-semibold text-slate-700">Education</h3>
              </div>

              <p className="text-sm leading-6 text-slate-600">
                {application.resumeEducation ||
                  "Education information not available."}
              </p>
            </div>

            {/* Resume File */}
            <div className="rounded-xl bg-slate-50 p-5">
              <div className="mb-3 flex items-center gap-2">
                <FileText size={18} className="text-violet-600" />

                <h3 className="font-semibold text-slate-700">Resume</h3>
              </div>

              <p className="text-sm text-slate-600">
                {application.resumeOriginalName || "Resume file not available"}
              </p>
            </div>
          </div>

          {/* Skills */}
          <div className="mt-6">
            <h3 className="mb-3 font-semibold text-slate-700">
              Detected Skills
            </h3>

            <TagList items={application.resumeSkills} type="normal" />
          </div>

          {/* Strengths */}
          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600" />

              <h3 className="font-semibold text-slate-700">Strengths</h3>
            </div>
            <TagList items={application.resumeStrengths} type="success" />
          </div>

          {/* Missing skills */}
          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <XCircle size={18} className="text-red-500" />

              <h3 className="font-semibold text-slate-700">Missing Skills</h3>
            </div>
            <TagList items={application.resumeMissingSkills} type="danger" />
          </div>
        </Section>

        <div className="mt-6 flex justify-end">
          <button type="button" disabled={action !== null}
            onClick={() => void handleEvaluationAction("assessmentReport")}
            className="flex items-center gap-2 rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-semibold text-violet-600 disabled:opacity-50">
            <FileText size={17} />
            {action === "assessmentReport" ? "Downloading..." : "Download Assessment Report"}
          </button>
        </div>
        <CandidateAssessmentReview
          key={application.id}
          applicationId={application.id}
          onEvaluated={() => void refreshApplicationStats()}
        />
        <Section title="Final Interview Feedback">
          {feedbackLoading ? (
            <p className="text-sm text-slate-500">Loading feedback...</p>
          ) : feedbackError ? (
            <p role="alert" className="text-sm text-red-600">
              {feedbackError}
            </p>
          ) : feedback.length === 0 ? (
            <p className="text-sm text-slate-500">
              The interviewer has not submitted feedback yet.
            </p>
          ) : (
            <div className="space-y-4">
              {feedback.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {item.assignment.round.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Interviewer: {item.interviewer.name}
                      </p>
                    </div>

                    <span className="h-fit rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                      {item.recommendation.replaceAll("_", " ")}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      ["Technical", item.technicalRating],
                      ["Communication", item.communicationRating],
                      ["Problem Solving", item.problemSolvingRating],
                      ["Overall", item.overallRating],
                    ].map(([label, value]) => (
                      <div
                        key={String(label)}
                        className="rounded-lg bg-slate-50 p-3"
                      >
                        <p className="text-xs text-slate-500">{label}</p>
                        <p className="mt-1 font-semibold text-violet-700">
                          {Number(value).toFixed(1)} / 5
                        </p>
                      </div>
                    ))}
                  </div>

                  {[
                    ["Strengths", item.strengths],
                    ["Weaknesses", item.weaknesses],
                    ["Comments", item.comments],
                  ].map(([label, text]) => (
                    <div key={label} className="mt-4">
                      <p className="text-sm font-semibold text-slate-700">
                        {label}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-500">
                        {text || "Not provided"}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Final Evaluation">
          <p className="text-sm text-slate-500">
            Final score combines 60% assessment performance and 40% interview
            performance. HR makes the hiring decision.
          </p>

          <p className="mt-3 text-2xl font-bold text-violet-700">
            {application.overallScore != null
              ? `${Number(application.overallScore).toFixed(1)}%`
              : "Not calculated"}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={
                action !== null || feedbackLoading || feedback.length === 0
              }
              onClick={() => void handleEvaluationAction("score")}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {action === "score" ? "Calculating..." : "Calculate Final Score"}
            </button>

            <button
              type="button"
              disabled={
                action !== null ||
                feedbackLoading ||
                feedback.length === 0 ||
                application.overallScore == null
              }
              onClick={() => void handleEvaluationAction("ai")}
              className="rounded-lg border border-violet-300 px-4 py-2 text-sm font-semibold text-violet-600 disabled:opacity-50"
            >
              {action === "ai" ? "Generating..." : "Generate AI Summary"}
            </button>

            <button
              type="button"
              disabled={
                action !== null ||
                feedbackLoading ||
                feedback.length === 0 ||
                application.overallScore == null
              }
              onClick={() => void handleEvaluationAction("report")}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
            >
              {action === "report" ? "Downloading..." : "Download Final Report"}
            </button>
          </div>

          {actionMessage && (
            <p role="status" className="mt-3 text-sm text-slate-600">
              {actionMessage}
            </p>
          )}
        </Section>

        {/* AI Final Evaluation */}
        {(application.aiCandidateSummary || application.aiRecommendation) && (
          <Section title="AI Candidate Evaluation">
            <div className="rounded-xl border border-violet-100 bg-violet-50 p-5">
              <div className="flex items-center gap-2">
                <Sparkles size={19} className="text-violet-600" />

                <h3 className="font-semibold text-slate-800">AI Summary</h3>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {application.aiCandidateSummary ||
                  "AI evaluation has not been generated yet."}
              </p>

              {application.aiRecommendation && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Recommendation
                  </p>

                  <p className="mt-1 font-semibold text-violet-700">
                    {application.aiRecommendation}
                  </p>
                </div>
              )}
            </div>

            {application.aiStrengths && application.aiStrengths.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-3 font-semibold text-slate-700">
                  AI Strengths
                </h3>

                <TagList items={application.aiStrengths} type="success" />
              </div>
            )}

            {application.aiConcerns && application.aiConcerns.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-3 font-semibold text-slate-700">
                  AI Concerns
                </h3>

                <TagList items={application.aiConcerns} type="danger" />
              </div>
            )}
          </Section>
        )}
      </main>
    </div>
  );
};

interface InfoCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const InfoCard = ({ title, value, icon }: InfoCardProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
          {icon}
        </div>

        <div>
          <p className="text-xs text-slate-400">{title}</p>

          <p className="mt-1 font-bold text-slate-700">{value}</p>
        </div>
      </div>
    </div>
  );
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section = ({ title, children }: SectionProps) => {
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="mb-5 text-lg font-bold text-slate-800">{title}</h2>

      {children}
    </section>
  );
};

const SmallInfo = ({ label, value }: { label: string; value: string }) => {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-slate-400">{label}</p>

      <p className="mt-1 text-sm font-medium text-slate-600">{value}</p>
    </div>
  );
};

const TagList = ({
  items,
  type,
}: {
  items: string[] | null;
  type: "normal" | "success" | "danger";
}) => {
  if (!items || items.length === 0) {
    return <p className="text-sm text-slate-400">No information available.</p>;
  }

  const styles = {
    normal: "bg-violet-100 text-violet-700",
    success: "bg-emerald-100 text-emerald-700",
    danger: "bg-red-100 text-red-600",
  };

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${styles[type]}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
};

export default CandidateDetails;
