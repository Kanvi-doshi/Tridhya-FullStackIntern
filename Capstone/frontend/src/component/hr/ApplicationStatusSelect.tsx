import { useMemo } from "react";
import {
  useApplicationAssessments,
  useApplicationFeedback,
  useJobRounds,
} from "../../component/hooks/queries";

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
  const needsChecks = status === "SHORTLISTED" || status === "INTERVIEWING";
  const roundsQ = useJobRounds<Round>(jobId, needsChecks);
  const reviewQ = useApplicationAssessments<ReviewRound>(
    applicationId,
    needsChecks,
  );
  const feedbackQ = useApplicationFeedback<Feedback>(
    applicationId,
    needsChecks,
  );

  const checking =
    needsChecks &&
    (roundsQ.isLoading || reviewQ.isLoading || feedbackQ.isLoading);
  const loadFailed =
    needsChecks && (roundsQ.isError || reviewQ.isError || feedbackQ.isError);
  const { assessmentsPassed, feedbackReady } = useMemo(() => {
    const activeRounds = (roundsQ.data ?? []).filter((r) => r.isActive);
    const assessments = activeRounds.filter((r) => r.type !== "INTERVIEW");
    const interviews = activeRounds.filter((r) => r.type === "INTERVIEW");
    return {
      assessmentsPassed:
        assessments.length === 3 &&
        assessments.every((round) =>
          (reviewQ.data ?? []).some(
            (review) =>
              review.id === round.id && review.attempt?.status === "PASSED",
          ),
        ),
      feedbackReady:
        interviews.length === 1 &&
        (feedbackQ.data ?? []).some(
          (f) => f.assignment.round.id === interviews[0].id,
        ),
    };
  }, [roundsQ.data, reviewQ.data, feedbackQ.data]);

  const allowed =
    status === "APPLIED"
      ? ["SHORTLISTED", "REJECTED"]
      : status === "SHORTLISTED" &&
          !checking &&
          !loadFailed &&
          assessmentsPassed
        ? ["INTERVIEWING", "REJECTED"]
        : status === "INTERVIEWING" && !checking && !loadFailed && feedbackReady
          ? ["REJECTED", ...(assessmentsPassed ? ["SELECTED"] : [])]
          : [];

  const eligibilityError = loadFailed
    ? "Cannot check eligibility. Reload the page."
    : "";
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
          : needsChecks && eligibilityError
            ? eligibilityError
            : status === "SHORTLISTED" && !assessmentsPassed
              ? "Wait until all three assessments are passed and evaluated."
              : status === "INTERVIEWING" && !feedbackReady
                ? "Wait for final interview feedback."
                : ["SELECTED", "REJECTED"].includes(status)
                  ? "Final decision recorded."
                  : ""}
      </p>
    </div>
  );
}
