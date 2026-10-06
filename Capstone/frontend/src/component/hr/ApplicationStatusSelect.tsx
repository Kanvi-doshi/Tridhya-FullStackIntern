import { useContext, useEffect, useState } from "react";
import api from "../../services/api";
import { HRRealtimeContext } from "../../context/RealtimeContext";

interface Props {
  applicationId: string;
  jobId: string;
  status: string;
  updating: boolean;
  onChange: (status: string) => void;
}

interface Round {
  id: string;
  type: string;
  isActive: boolean;
}

interface ReviewRound {
  id: string;
  attempt: { status: string } | null;
}

interface Feedback {
  assignment: {
    round: { id: string };
  };
}

const statuses = [
  "APPLIED",
  "SHORTLISTED",
  "INTERVIEWING",
  "SELECTED",
  "REJECTED",
];

export default function ApplicationStatusSelect({
  applicationId,
  jobId,
  status,
  updating,
  onChange,
}: Props) {
  const [eligibility, setEligibility] = useState({
    key: "",
    assessmentsPassed: false,
    feedbackReady: false,
    error: "",
  });
  const hrRevision = useContext(HRRealtimeContext);
  const key = `${applicationId}:${jobId}:${status}:${hrRevision}`;
  const needsChecks = status === "SHORTLISTED" || status === "INTERVIEWING";
  const checking = needsChecks && eligibility.key !== key;

  useEffect(() => {
    if (!needsChecks) return;

    let cancelled = false;

    const load = async () => {
      try {
        const [roundResponse, reviewResponse, feedbackResponse] =
          await Promise.all([
            api.get<{ rounds: Round[] }>(`/interview-round/job/${jobId}`),
            api.get<{ rounds: ReviewRound[] }>(
              `/application/${applicationId}/assessments`,
            ),
            api.get<{ feedback: Feedback[] }>(
              `/interview-feedback/application/${applicationId}`,
            ),
          ]);

        const activeRounds = roundResponse.data.rounds.filter(
          (round) => round.isActive,
        );
        const assessments = activeRounds.filter(
          (round) => round.type !== "INTERVIEW",
        );
        const interviews = activeRounds.filter(
          (round) => round.type === "INTERVIEW",
        );

        if (!cancelled) {
          setEligibility({
            key,
            assessmentsPassed:
              assessments.length === 3 &&
              assessments.every((round) =>
                reviewResponse.data.rounds.some(
                  (review) =>
                    review.id === round.id &&
                    review.attempt?.status === "PASSED",
                ),
              ),
            feedbackReady:
              interviews.length === 1 &&
              feedbackResponse.data.feedback.some(
                (feedback) => feedback.assignment.round.id === interviews[0].id,
              ),
            error: "",
          });
        }
      } catch {
        if (!cancelled) {
          setEligibility({
            key,
            assessmentsPassed: false,
            feedbackReady: false,
            error: "Cannot check eligibility. Reload the page.",
          });
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [applicationId, jobId, status, key, needsChecks]);

  const allowed =
    status === "APPLIED"
      ? ["SHORTLISTED", "REJECTED"]
      : status === "SHORTLISTED" && !checking && eligibility.assessmentsPassed
        ? ["INTERVIEWING", "REJECTED"]
        : status === "INTERVIEWING" && !checking && eligibility.feedbackReady
          ? ["REJECTED", ...(eligibility.assessmentsPassed ? ["SELECTED"] : [])]
          : [];

  return (
    <div>
      <select
        aria-label="Application status"
        value={status}
        disabled={updating || checking || allowed.length === 0}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
      >
        {statuses.map((option) => (
          <option
            key={option}
            value={option}
            disabled={option !== status && !allowed.includes(option)}
          >
            {option}
          </option>
        ))}
      </select>

      <p className="mt-1 max-w-xs text-xs text-slate-500">
        {checking
          ? "Checking eligibility..."
          : needsChecks && eligibility.error
            ? eligibility.error
            : status === "SHORTLISTED" && !eligibility.assessmentsPassed
              ? "Wait until all three assessments are passed and evaluated."
              : status === "INTERVIEWING" && !eligibility.feedbackReady
                ? "Wait for final interview feedback."
                : ["SELECTED", "REJECTED"].includes(status)
                  ? "Final decision recorded."
                  : ""}
      </p>
    </div>
  );
}