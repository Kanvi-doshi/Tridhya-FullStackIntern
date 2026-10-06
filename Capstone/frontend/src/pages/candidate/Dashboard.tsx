import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Copy,
  MapPin,
  ExternalLink,
  Sparkles,
  X,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import api from "../../services/api";
import { HRRealtimeContext } from "../../context/RealtimeContext";

interface Application {
  id: string;
  status: string;
  overallScore: number | null;
  currentRound: number;
  appliedAt: string;
  updatedAt: string;
  jobMatchScore: string | null;

  job: {
    id: string;
    title: string;
    description: string;
    location: string;
    experienceRequired: string;
    skills: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface Interview {
  id: string;
  scheduledAt: string;
  endsAt: string | null;
  location: string;
  status: string;

  application: {
    id: string;

    job: {
      id: string;
      title: string;
      location: string;
    };
  };

  round: {
    id: string;
    name: string;
    type: string;
  };

  interviewer: {
    id: string;
    name: string;
    email: string;
  };
}

interface AssessmentAttempt {
  id: string;
  roundId: string;
  status: "IN_PROGRESS" | "PENDING_EVALUATION" | "PASSED" | "FAILED";
}

interface AssessmentRound {
  id: string;
  title: string;
  type: string;
  roundNumber: number;
  isActive: boolean;
}

const AssessmentStatus = ({ jobId }: { jobId: string }) => {
  const navigate = useNavigate();
  const revision = useContext(HRRealtimeContext);

  const [rounds, setRounds] = useState<AssessmentRound[]>([]);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchAssessmentStatus = async () => {
      try {
        const [roundResponse, attemptResponse] = await Promise.all([
          api.get(`/interview-round/job/${jobId}`),
          api.get(`/assessment/job/${jobId}/my`),
        ]);

        const assessmentRounds = (roundResponse.data.rounds || [])
          .filter(
            (round: AssessmentRound) =>
              round.isActive && round.type !== "INTERVIEW",
          )
          .sort(
            (a: AssessmentRound, b: AssessmentRound) =>
              a.roundNumber - b.roundNumber,
          );

        if (cancelled) return;
        setRounds(assessmentRounds);
        setAttempts(attemptResponse.data.attempts || []);
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to load assessment status:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAssessmentStatus();
    return () => {
      cancelled = true;
    };
  }, [jobId, revision]);

  if (loading || rounds.length === 0) {
    return null;
  }

  // Check failed round
  const failedRound = rounds.find((round) => {
    const attempt = attempts.find((attempt) => attempt.roundId === round.id);

    return attempt?.status === "FAILED";
  });

  if (failedRound) {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-600">
        ROUND {failedRound.roundNumber} FAILED
      </span>
    );
  }

  // Check pending evaluation
  const pendingRound = rounds.find((round) => {
    const attempt = attempts.find((attempt) => attempt.roundId === round.id);

    return attempt?.status === "PENDING_EVALUATION";
  });

  if (pendingRound) {
    return (
      <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
        ROUND {pendingRound.roundNumber} PENDING
      </span>
    );
  }

  // Check in-progress assessment
  const inProgressRound = rounds.find((round) => {
    const attempt = attempts.find((attempt) => attempt.roundId === round.id);

    return attempt?.status === "IN_PROGRESS";
  });

  if (inProgressRound) {
    const attempt = attempts.find(
      (attempt) => attempt.roundId === inProgressRound.id,
    );

    return (
      <button
        onClick={(event) => {
          event.stopPropagation();

          navigate(`/assessment/${attempt!.id}`);
        }}
        className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-200"
      >
        CONTINUE ROUND {inProgressRound.roundNumber} →
      </button>
    );
  }

  // Find first round not attempted yet
  const nextRound = rounds.find((round) => {
    const attempt = attempts.find((attempt) => attempt.roundId === round.id);

    return !attempt;
  });

  if (nextRound) {
    // Make sure all previous rounds passed
    const previousRoundsPassed = rounds
      .filter((round) => round.roundNumber < nextRound.roundNumber)
      .every((round) => {
        const attempt = attempts.find(
          (attempt) => attempt.roundId === round.id,
        );

        return attempt?.status === "PASSED";
      });

    if (previousRoundsPassed) {
      return (
        <button
          onClick={(event) => {
            event.stopPropagation();

            navigate(`/assessment/start/${nextRound.id}`);
          }}
          className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-200"
        >
          {nextRound.roundNumber === 1
            ? "START ROUND 1 →"
            : `CONTINUE TO ROUND ${nextRound.roundNumber} →`}
        </button>
      );
    }
  }

  // Everything passed
  const allPassed = rounds.every((round) => {
    const attempt = attempts.find((attempt) => attempt.roundId === round.id);

    return attempt?.status === "PASSED";
  });

  if (allPassed) {
    return (
      <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
        ASSESSMENTS PASSED
      </span>
    );
  }

  return null;
};

const CandidateDash = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const revision = useContext(HRRealtimeContext);

  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(
    null,
  );
  const [copiedMeetingCode, setCopiedMeetingCode] = useState(false);
  const [copyError, setCopyError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [applicationRes, interviewRes] = await Promise.all([
          api.get("/application/my"),
          api.get("/interview-assignment/candidate/my"),
        ]);

        if (cancelled) return;
        setApplications(applicationRes.data.applications || []);
        setInterviews(interviewRes.data.assignments || []);
      } catch (error: any) {
        if (cancelled) return;
        console.error("Failed to load candidate dashboard:", error);

        setError(
          error.response?.data?.message || "Failed to load candidate dashboard",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDashboard();
    return () => {
      cancelled = true;
    };
  }, [revision]);

  const totalApplications = applications.length;

  const inProgress = applications.filter((application) =>
    ["SHORTLISTED", "INTERVIEWING"].includes(application.status),
  ).length;

  const selected = applications.filter(
    (application) => application.status === "SELECTED",
  ).length;

  const recentApplications = [...applications]
    .sort(
      (a, b) =>
        new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime(),
    )
    .slice(0, 3);

  const upcomingInterviews = interviews
    .filter(
      (interview) =>
        new Date(interview.scheduledAt).getTime() > Date.now() &&
        interview.status !== "COMPLETED" &&
        interview.status !== "CANCELLED",
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    )
    .slice(0, 3);

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />

          <p className="mt-4 text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}

      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
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

            <button
              onClick={() => navigate("/profile")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-600 transition hover:bg-violet-200"
              title="View profile"
            >
              {user?.name?.charAt(0).toUpperCase() || "C"}
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome */}

        <div className="mb-8 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-7 text-white">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-violet-100">Candidate Dashboard</p>

              <h2 className="mt-1 text-3xl font-bold">
                Welcome back, {user?.name}
              </h2>

              <p className="mt-2 text-violet-100">
                Track your applications, assessments and upcoming interviews.
              </p>
            </div>

            <button
              onClick={() => navigate("/job")}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-violet-600 transition hover:bg-violet-50"
            >
              <BriefcaseBusiness size={18} />
              Browse Jobs
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Applications"
            value={totalApplications}
            icon={<BriefcaseBusiness size={21} />}
          />

          <StatCard
            title="In Progress"
            value={inProgress}
            icon={<ClipboardList size={21} />}
          />

          <StatCard
            title="Selected"
            value={selected}
            icon={<CheckCircle2 size={21} />}
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-800">
                  Recent Applications
                </h3>

                <p className="text-sm text-slate-400">
                  Track your latest job applications
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/application")}
                  className="flex items-center gap-1 text-sm font-semibold text-violet-600 hover:text-violet-700"
                >
                  View All
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {recentApplications.length === 0 ? (
              <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center">
                <BriefcaseBusiness size={30} className="mb-3 text-slate-300" />

                <p className="font-medium text-slate-600">
                  No applications yet
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Your submitted job applications will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((application) => (
                  <div
                    key={application.id}
                    className="flex flex-col justify-between gap-4 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-700">
                        {application.job.title}
                      </h4>

                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin size={13} />

                          {application.job.location}
                        </span>

                        <span>
                          Applied{" "}
                          {new Date(application.appliedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                            application.status,
                          )}`}
                        >
                          {application.status}
                        </span>

                        {["SHORTLISTED", "INTERVIEWING"].includes(
                          application.status,
                        ) && <AssessmentStatus jobId={application.job.id} />}
                      </div>

                      <button
                        onClick={() =>
                          navigate(`/application/${application.id}`)
                        }
                        className="text-slate-400 transition hover:text-violet-600"
                        title="View application"
                      >
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">
                  Upcoming Interviews
                </h3>

                <p className="text-sm text-slate-400">
                  Your interview schedule
                </p>
              </div>

              <CalendarDays size={20} className="text-violet-600" />
            </div>

            {upcomingInterviews.length === 0 ? (
              <div className="flex min-h-44 flex-col items-center justify-center text-center">
                <Clock3 size={30} className="mb-3 text-slate-300" />

                <p className="font-medium text-slate-600">Nothing scheduled</p>

                <p className="mt-1 text-sm text-slate-400">
                  Upcoming interviews will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingInterviews.map((interview) => (
                  <button
                    key={interview.id}
                    type="button"
                    onClick={() => {
                      setSelectedInterview(interview);
                      setCopiedMeetingCode(false);
                      setCopyError("");
                    }}
                    className="block w-full rounded-xl bg-violet-50 p-4 text-left transition hover:bg-violet-100"
                  >
                    <p className="font-semibold text-slate-700">
                      {interview.application?.job?.title || "Interview"}
                    </p>

                    {interview.round?.name && (
                      <p className="mt-1 text-xs font-medium text-violet-600">
                        {interview.round.name}
                      </p>
                    )}

                    <div className="mt-3 flex items-start gap-2 text-sm text-slate-500">
                      <CalendarDays size={15} className="mt-0.5 shrink-0" />
                      <span>
                        {new Date(interview.scheduledAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <MapPin size={15} className="shrink-0" />
                      <span className="break-all">{interview.location}</span>
                    </div>

                    <span className="mt-3 inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                      {interview.status}
                    </span>

                    <span className="mt-3 block text-sm font-semibold text-violet-700">
                      View interview details
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      {selectedInterview &&
        (() => {
          const meetingCode = selectedInterview.location
            .match(/(?:meet\.google\.com\/)?([a-z]{3}-[a-z]{4}-[a-z]{3})/i)?.[1]
            ?.toLowerCase();

          const googleMeetUrl = selectedInterview.location.match(
            /https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}/i,
          )?.[0];

          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              onClick={() => setSelectedInterview(null)}
            >
              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="interview-modal-title"
                className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-violet-600">
                      Upcoming interview
                    </p>
                    <h2
                      id="interview-modal-title"
                      className="mt-1 text-xl font-bold text-slate-800"
                    >
                      {selectedInterview.application?.job?.title || "Interview"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedInterview.round?.name}
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label="Close interview details"
                    onClick={() => setSelectedInterview(null)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-400">
                      Starts
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {new Date(selectedInterview.scheduledAt).toLocaleString()}
                    </p>
                  </div>

                  {selectedInterview.endsAt && (
                    <div>
                      <p className="text-xs font-medium uppercase text-slate-400">
                        Ends
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {new Date(selectedInterview.endsAt).toLocaleString()}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-medium uppercase text-slate-400">
                      Interviewer
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {selectedInterview.interviewer?.name || "Not provided"}
                    </p>
                    {selectedInterview.interviewer?.email && (
                      <p className="text-sm text-slate-500">
                        {selectedInterview.interviewer.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase text-slate-400">
                      Meeting details
                    </p>
                    <p className="mt-1 break-all text-sm text-slate-700">
                      {selectedInterview.location}
                    </p>
                  </div>

                  {meetingCode && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4">
                      <div>
                        <p className="text-xs text-slate-500">
                          Google Meet code
                        </p>
                        <code className="mt-1 block font-semibold text-slate-800">
                          {meetingCode}
                        </code>
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(meetingCode);
                            setCopiedMeetingCode(true);
                            setCopyError("");
                          } catch {
                            setCopiedMeetingCode(false);
                            setCopyError(
                              "Could not copy the code. Please copy it manually.",
                            );
                          }
                        }}
                        className="flex items-center gap-2 rounded-lg border border-violet-200 px-3 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50"
                      >
                        <Copy size={15} />
                        {copiedMeetingCode ? "Copied" : "Copy code"}
                      </button>

                      {copyError && (
                        <p role="alert" className="w-full text-sm text-red-600">
                          {copyError}
                        </p>
                      )}
                    </div>
                  )}

                  {googleMeetUrl && (
                    <a
                      href={googleMeetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                    >
                      Join Google Meet
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>
              </section>
            </div>
          );
        })()}
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <h3 className="mt-2 text-3xl font-bold text-slate-800">{value}</h3>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default CandidateDash;
