import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useJobRounds, useMyAttempts } from "../../component/hooks/queries";

interface Round {
  id: string;
  title: string;
  type: string;
  roundNumber: number;
  durationMinutes: number | null;
  isActive: boolean;
}

interface AttemptSummary {
  id: string;
  roundId: string;
  status: "IN_PROGRESS" | "PENDING_EVALUATION" | "PASSED" | "FAILED";
}

export default function AssessmentRounds({
  jobId,
  applicationStatus,
}: {
  jobId: string;
  applicationStatus: string;
  }) {
  const {
    data: allRounds = [],
    isLoading: roundsLoading,
    error: roundsError,
  } = useJobRounds<Round>(jobId);
  const {
    data: attempts = [],
    isLoading: attemptsLoading,
    error: attemptsError,
  } = useMyAttempts<AttemptSummary>(jobId);

  const loading = roundsLoading || attemptsLoading;
  const error =
    roundsError || attemptsError ? "Unable to load assessment rounds." : "";

  const rounds = useMemo(
    () =>
      allRounds
        .filter((round) => round.isActive)
        .sort((a, b) => a.roundNumber - b.roundNumber),
    [allRounds],
  );

  return (
    <section className="my-6 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold">Assessments</h2>

      {loading && <p className="mt-3">Loading assessments...</p>}
      {error && <p className="mt-3 text-red-600">{error}</p>}

      {!loading && !error && rounds.length === 0 && (
        <p className="mt-3 text-slate-500">No active assessments available.</p>
      )}

      <div className="mt-4 space-y-3">
        {rounds
          .filter((round) => round.type !== "INTERVIEW")
          .map((round) => {
            const attempt = attempts.find((item) => item.roundId === round.id);

            const submitted =
              attempt !== undefined && attempt.status !== "IN_PROGRESS";

            const blockingRound = rounds.find((previousRound) => {
              if (previousRound.roundNumber >= round.roundNumber) return false;

              // Interview advancement needs its own HR approval logic.
              if (previousRound.type === "INTERVIEW") return true;

              const previousAttempt = attempts.find(
                (item) => item.roundId === previousRound.id,
              );

              return previousAttempt?.status !== "PASSED";
            });

            const blockingAttempt = attempts.find(
              (item) => item.roundId === blockingRound?.id,
            );

            let lockMessage = "";

            if (blockingRound) {
              if (blockingRound.type === "INTERVIEW") {
                lockMessage = "Waiting for interview-round approval.";
              } else if (blockingAttempt?.status === "FAILED") {
                lockMessage = `Round ${blockingRound.roundNumber} was not passed.`;
              } else if (blockingAttempt?.status === "PENDING_EVALUATION") {
                lockMessage = `Round ${blockingRound.roundNumber} is awaiting evaluation.`;
              } else {
                lockMessage = `Pass Round ${blockingRound.roundNumber} first.`;
              }
            }
            return (
              <div
                key={round.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-4"
              >
                <div>
                  <p className="font-medium">
                    Round {round.roundNumber}: {round.title}
                  </p>

                  <p className="text-sm text-slate-500">
                    {round.type} ·{" "}
                    {round.durationMinutes
                      ? `${round.durationMinutes} minutes`
                      : "No time limit"}
                  </p>

                  {attempt && (
                    <p className="mt-1 text-sm font-medium text-violet-600">
                      {attempt.status.replaceAll("_", " ")}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  {submitted && attempt ? (
                    <>
                      <button
                        disabled
                        className="cursor-not-allowed rounded-lg bg-slate-200 px-4 py-2 text-slate-500"
                      >
                        {attempt?.status === "PENDING_EVALUATION"
                          ? "Evaluation Pending"
                          : attempt.status === "FAILED"
                            ? "Assessment Failed"
                            : "Assessment Passed"}
                      </button>

                      <Link
                        to={`/assessment/${attempt!.id}/result`}
                        className="rounded-lg border border-violet-600 px-4 py-2 text-violet-600"
                      >
                        View Result
                      </Link>
                    </>
                  ) : applicationStatus !== "SHORTLISTED" ? (
                    <button
                      type="button"
                      disabled
                      className="cursor-not-allowed rounded-lg bg-slate-200 px-4 py-2 text-slate-500"
                    >
                      {applicationStatus === "APPLIED"
                        ? "Waiting for HR Shortlisting"
                        : "Assessment Locked"}
                    </button>
                  ) : blockingRound ? (
                    <button
                      disabled
                      title={lockMessage}
                      className="cursor-not-allowed rounded-lg bg-slate-200 px-4 py-2 text-slate-500"
                    >
                      Locked
                    </button>
                  ) : (
                    <Link
                      to={
                        attempt
                          ? `/assessment/${attempt.id}`
                          : `/assessment/start/${round.id}`
                      }
                      className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-700"
                    >
                      {attempt
                        ? "Resume Assessment"
                        : round.roundNumber === 1
                          ? "Shortlisted — Start Assessment"
                          : "Start Assessment"}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}
