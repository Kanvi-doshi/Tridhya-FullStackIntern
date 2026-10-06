import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Download,
  Mail,
  MapPin,
  MessageSquareText,
  User,
  Video,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { HRRealtimeContext } from "../../context/RealtimeContext";

interface Assignment {
  id: string;
  scheduledAt: string;
  location: string;
  status: string;
  endsAt: string | null;

  application: {
    id: string;
    status: string;
    jobMatchScore?: string | number | null;
    resumeOriginalName?: string | null;
    resumeSummary?: string | null;
    resumeSkills?: string[] | null;
    resumeExperience?: string | null;
    resumeEducation?: string | null;

    candidate: {
      id: string;
      name: string;
      email: string;
    };

    job: {
      id: string;
      title: string;
      description?: string;
      location: string;
      experienceRequired?: string;
      skills?: string;
    };
  };

  round: {
    id: string;
    name?: string;
    title?: string;
    roundNumber?: number;
    type?: string;
  };
}

export interface InterviewResponse {
  interview: Assignment;
  canSubmitFeedback: boolean;
  feedbackMessage: string;
  feedback: {
    technicalRating: number | string;
    communicationRating: number | string;
    problemSolvingRating: number | string;
    overallRating: number | string;
    recommendation: string;
    strengths: string | null;
    weaknesses: string | null;
    comments: string | null;
  } | null;
  assessments: {
    id: string;
    roundNumber: number;
    title: string;
    status: string;
    score: number | string | null;
    obtainedMarks: number | string | null;
    totalMarks: number | null;
  }[];
}

const InterviewDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const revision = useContext(HRRealtimeContext);
  const [details, setDetails] = useState<InterviewResponse | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Interview ID is missing.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchInterview = async () => {
      try {
        setLoading(true);
        const response = await api.get<InterviewResponse>(
          `/interviewer/interviews/${id}`,
        );

        if (!cancelled) {
          setDetails(response.data);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setDetails(null);
          setError(
            "This interview is unavailable or no longer assigned to you.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchInterview();

    return () => {
      cancelled = true;
    };
  }, [id, revision, refreshKey]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
      </div>
    );
  }

  if (error || !details || details.interview.id !== id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">{error}</p>

          <button
            onClick={() => navigate("/interview")}
            className="mt-5 rounded-lg bg-violet-600 px-4 py-2 text-white"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const assignment = details.interview;
  const application = assignment.application;
  let meetingUrl = "";
  try {
    const url = new URL(assignment.location);
    if (["http:", "https:"].includes(url.protocol)) meetingUrl = url.href;
  } catch {
    // A physical location is displayed as text.
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-6">
          <button
            onClick={() => navigate("/interview")}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-violet-600"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-xl font-bold">Interview Details</h1>

            <p className="text-sm text-violet-100">
              Candidate and interview information
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* CANDIDATE */}
        <Section title="Candidate Information">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-xl font-bold text-violet-600">
              {application.candidate.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {application.candidate.name}
              </h2>

              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <Mail size={15} />
                {application.candidate.email}
              </p>
            </div>
          </div>
        </Section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* INTERVIEW */}

          <Section title="Interview Schedule">
            <Info
              icon={<CalendarDays size={17} />}
              label="Scheduled"
              value={new Date(assignment.scheduledAt).toLocaleString("en-IN")}
            />

            <Info
              icon={<CalendarDays size={17} />}
              label="Ends"
              value={assignment.endsAt
                ? new Date(assignment.endsAt).toLocaleString("en-IN")
                : "Not specified"}
            />
            <Info
              icon={<MapPin size={17} />}
              label="Location"
              value={assignment.location}
            />
            {meetingUrl && !["CANCELLED", "COMPLETED"].includes(assignment.status) && (
              <a href={meetingUrl} target="_blank" rel="noopener noreferrer"
                className="mb-4 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm text-white">
                <Video size={17} /> Join Meeting
              </a>
            )}

            <Info
              icon={<Video size={17} />}
              label="Status"
              value={assignment.status}
            />

            <Info
              icon={<User size={17} />}
              label="Round"
              value={
                assignment.round?.name ||
                assignment.round?.title ||
                `Round ${assignment.round?.roundNumber || ""}`
              }
            />
          </Section>

          {/* JOB */}

          <Section title="Job Information">
            <h3 className="font-bold text-slate-800">
              {application.job.title}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {application.job.description}
            </p>

            <div className="mt-4">
              <Info
                icon={<MapPin size={17} />}
                label="Location"
                value={application.job.location}
              />

              {application.job.experienceRequired && (
                <Info
                  icon={<BriefcaseBusiness size={17} />}
                  label="Experience"
                  value={application.job.experienceRequired}
                />
              )}
            </div>
          </Section>
        </div>

        {/* RESUME */}

        <div className="mt-6">
          <Section title="Candidate Resume Analysis">
            <button type="button" disabled={resumeLoading || assignment.status === "CANCELLED"}
              onClick={async () => {
                setResumeLoading(true);
                setResumeError("");
                try {
                  const response = await api.get(
                    `/application/${application.id}/resume?download=true`,
                    { responseType: "blob" },
                  );
                  const url = URL.createObjectURL(response.data);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = application.resumeOriginalName || "resume.pdf";
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                } catch {
                  setResumeError("Unable to download this resume.");
                } finally {
                  setResumeLoading(false);
                }
              }}
              className="mb-4 flex items-center gap-2 rounded-lg border border-violet-200 px-4 py-2 text-sm text-violet-600 disabled:opacity-50">
              <Download size={17} />
              {resumeLoading ? "Downloading..." : "Download Resume"}
            </button>
            {resumeError && <p role="alert" className="mb-3 text-sm text-red-600">{resumeError}</p>}
            <p className="text-sm leading-6 text-slate-500">
              {application.resumeSummary || "Resume analysis is not available."}
            </p>

            {application.resumeSkills &&
              application.resumeSkills.length > 0 && (
                <div className="mt-5">
                  <p className="text-sm font-semibold text-slate-700">Skills</p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {application.resumeSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </Section>
        </div>

        <div className="mt-6">
          <Section title="Assessment Results">
            {details.assessments.length === 0 ? (
              <p className="text-sm text-slate-500">No assessment attempts available.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                {details.assessments.map((assessment) => (
                  <div key={assessment.id} className="rounded-lg bg-slate-50 p-4">
                    <p className="font-semibold text-slate-800">
                      Round {assessment.roundNumber}: {assessment.title}
                    </p>
                    <p className="mt-2 text-sm text-violet-600">
                      {assessment.status.replaceAll("_", " ")}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Score: {assessment.score == null ? "Pending" : `${Number(assessment.score).toFixed(1)}%`}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Marks: {assessment.obtainedMarks ?? "?"} / {assessment.totalMarks ?? "?"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        {details.feedback && (
          <div className="mt-6">
            <Section title="Submitted Feedback">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Technical", value: details.feedback.technicalRating },
                  { label: "Communication", value: details.feedback.communicationRating },
                  { label: "Problem Solving", value: details.feedback.problemSolvingRating },
                  { label: "Overall", value: details.feedback.overallRating },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-1 font-semibold">{Number(value).toFixed(1)} / 5</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 font-semibold text-violet-600">
                {details.feedback.recommendation.replaceAll("_", " ")}
              </p>
              {[
                { label: "Strengths", value: details.feedback.strengths },
                { label: "Weaknesses", value: details.feedback.weaknesses },
                { label: "Comments", value: details.feedback.comments },
              ].map(({ label, value }) => (
                <div key={label} className="mt-4">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-500">{value || "Not provided"}</p>
                </div>
              ))}
            </Section>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            className="rounded-lg border border-violet-200 px-4 py-2 text-sm text-violet-600"
          >
            Refresh Status
          </button>

          {!details?.feedback && (
            <button
              type="button"
              disabled={!details?.canSubmitFeedback}
              onClick={() => navigate(`/interview/${assignment.id}/feedback`)}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              <MessageSquareText size={17} />
              Submit Feedback
            </button>
          )}
        </div>

        {details?.feedbackMessage && (
          <p className="mt-2 text-right text-sm text-slate-500">
            {details.feedbackMessage}
          </p>
        )}
      </main>
    </div>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6">
    <h3 className="mb-5 font-bold text-slate-800">{title}</h3>
    {children}
  </div>
);

const Info = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="mb-4 flex items-start gap-3 last:mb-0">
    <div className="mt-0.5 text-violet-600">{icon}</div>

    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-700">{value}</p>
    </div>
  </div>
);

export default InterviewDetails;
