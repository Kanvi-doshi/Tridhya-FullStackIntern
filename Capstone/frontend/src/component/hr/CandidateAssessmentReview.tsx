import { useContext, useEffect, useState } from "react";
import axios from "axios";
import api from "../../services/api";
import WrittenAnswerEvaluation from "./WrittenAnswerEvaluation";
import { HRRealtimeContext } from "../../context/RealtimeContext";

type Numeric = number | string;

type AttemptStatus = "IN_PROGRESS" | "PENDING_EVALUATION" | "PASSED" | "FAILED";

interface ReviewAnswer {
  id: string;
  text: string | null;
  marksObtained: Numeric | null;
  isCorrect: boolean | null;
  passedTestCases: number | null;
  totalTestCases: number | null;
  feedback: string | null;
}

interface ReviewQuestion {
  id: string;
  text: string;
  type: string;
  marks: number;
  options: string[] | null;
  correctAnswer: string | null;
  answer: ReviewAnswer | null;
}

interface ReviewRound {
  id: string;
  title: string;
  type: string;
  roundNumber: number;
  passingScore: Numeric | null;
  isActive: boolean;
  attempt: {
    id: string;
    status: AttemptStatus;
    score: Numeric | null;
    obtainedMarks: Numeric | null;
    totalMarks: number | null;
    startedAt: string | null;
    submittedAt: string | null;
    autoSubmitted: boolean;
    autoSubmitReason: string | null;
    tabSwitchCount: number;
    violationCount: number;
  } | null;
  questions: ReviewQuestion[];
}

function formatNumber(value: Numeric | null | undefined) {
  if (value === null || value === undefined) return "—";
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(1) : "—";
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

function statusStyle(status: string) {
  switch (status) {
    case "PASSED":
      return "bg-emerald-100 text-emerald-700";
    case "FAILED":
      return "bg-red-100 text-red-700";
    case "PENDING_EVALUATION":
      return "bg-amber-100 text-amber-700";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function CandidateAssessmentReview({
  applicationId,
  onEvaluated,
}: {
  applicationId: string;
  onEvaluated?: () => void;
}) {
  const [rounds, setRounds] = useState<ReviewRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [evaluationBusy, setEvaluationBusy] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const hrRevision = useContext(HRRealtimeContext);

  useEffect(() => {
    let cancelled = false;
    const loadReview = async () => {
      setError("");

      try {
        const response = await api.get<{ rounds: ReviewRound[] }>(
          `/application/${applicationId}/assessments`,
        );
        if (!cancelled) {
          setRounds(response.data.rounds);
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setError(
            axios.isAxiosError<{ message?: string }>(error)
              ? error.response?.data?.message ||
                  "Unable to load assessment review."
              : "Unable to load assessment review.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void loadReview();
    return () => {
      cancelled = true;
    };
  }, [applicationId, refreshKey, hrRevision]);

  const passedCount = rounds.filter(
    (round) => round.attempt?.status === "PASSED",
  ).length;

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Assessment Review
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Review round results, candidate answers, and awarded marks.
          </p>
        </div>

        <button
          type="button"
          disabled={loading || evaluationBusy}
          onClick={() => setRefreshKey((value) => value + 1)}
          className="rounded-lg border border-violet-200 px-4 py-2 text-sm font-semibold text-violet-600 hover:bg-violet-50 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {successMessage && (
        <p
          role="status"
          className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"
        >
          {successMessage}
        </p>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500" role="status">
          Loading assessment results...
        </p>
      ) : error ? (
        <p
          className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      ) : rounds.length === 0 ? (
        <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
          No assessment rounds are available for this application.
        </p>
      ) : (
        <>
          <div className="mt-5 rounded-xl bg-violet-50 px-4 py-3 text-sm font-medium text-violet-700">
            {passedCount} of {rounds.length} assessment rounds passed.
          </div>

          <div className="mt-5 space-y-4">
            {rounds.map((round) => {
              const attempt = round.attempt;
              const status = attempt?.status ?? "NOT_STARTED";
              const isSubmitted =
                attempt !== null && attempt.status !== "IN_PROGRESS";

              return (
                <article
                  key={round.id}
                  className="overflow-hidden rounded-xl border border-slate-200"
                >
                  <div className="bg-slate-50 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          Round {round.roundNumber}: {round.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {round.type}
                          {round.passingScore !== null &&
                            ` · Pass mark: ${formatNumber(round.passingScore)}%`}
                          {!round.isActive && " · Inactive round"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(status)}`}
                      >
                        {status.replaceAll("_", " ")}
                      </span>
                    </div>

                    {attempt && (
                      <>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          <Metric
                            label={
                              attempt.status === "PENDING_EVALUATION"
                                ? "Score (provisional)"
                                : "Score"
                            }
                            value={
                              attempt.score === null
                                ? "Not evaluated"
                                : `${formatNumber(attempt.score)}%`
                            }
                          />
                          <Metric
                            label="Marks"
                            value={`${formatNumber(attempt.obtainedMarks)} / ${attempt.totalMarks ?? "—"}`}
                          />
                          <Metric
                            label="Started"
                            value={formatDate(attempt.startedAt)}
                          />
                          <Metric
                            label="Submitted"
                            value={formatDate(attempt.submittedAt)}
                          />
                          <Metric
                            label="Tab switches"
                            value={`${attempt.tabSwitchCount ?? 0} / 3`}
                          />

                          <Metric
                            label="Total violations"
                            value={String(attempt.violationCount ?? 0)}
                          />
                        </div>

                        {attempt.autoSubmitted && (
                          <p className="mt-4 text-sm text-amber-700">
                            Automatically submitted
                            {attempt.autoSubmitReason
                              ? `: ${attempt.autoSubmitReason.replaceAll("_", " ")}`
                              : "."}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {!attempt ? (
                    <p className="p-5 text-sm text-slate-500">
                      The candidate has not started this assessment.
                    </p>
                  ) : !isSubmitted ? (
                    <p className="p-5 text-sm text-blue-600">
                      Assessment in progress. Review submitted answers once the
                      candidate finishes.
                    </p>
                  ) : (
                    <details className="p-5">
                      <summary className="cursor-pointer font-semibold text-violet-600">
                        Review answers ({round.questions.length})
                      </summary>

                      {round.questions.length === 0 ? (
                        <p className="mt-4 text-sm text-slate-500">
                          No questions available.
                        </p>
                      ) : (
                        <div className="mt-5 space-y-5">
                          {round.questions.map((question, index) => (
                            <div
                              key={question.id}
                              className="rounded-xl border border-slate-200 p-4"
                            >
                              <div className="flex flex-wrap justify-between gap-2">
                                <p className="text-xs font-semibold text-violet-600">
                                  Question {index + 1} · {question.type}
                                </p>

                                <p className="text-xs font-semibold text-slate-500">
                                  Marks:{" "}
                                  {formatNumber(question.answer?.marksObtained)}{" "}
                                  / {question.marks}
                                </p>
                              </div>

                              <p className="mt-3 whitespace-pre-wrap text-sm font-medium text-slate-800">
                                {question.text}
                              </p>

                              {question.options &&
                                question.options.length > 0 && (
                                  <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-500">
                                    {question.options.map((option, i) => (
                                      <li key={`${question.id}-${i}`}>
                                        {option}
                                      </li>
                                    ))}
                                  </ul>
                                )}

                              <p className="mt-4 text-xs font-semibold uppercase text-slate-500">
                                Candidate answer
                              </p>

                              <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                                {question.answer?.text?.trim()
                                  ? question.answer.text
                                  : "No answer submitted."}
                              </pre>

                              {question.type === "MCQ" &&
                                question.correctAnswer !== null && (
                                  <p className="mt-3 text-sm text-emerald-700">
                                    Correct answer: {question.correctAnswer}
                                  </p>
                                )}

                              {question.type === "CODING" &&
                                question.answer?.totalTestCases != null && (
                                  <p className="mt-3 text-sm text-slate-600">
                                    Test cases passed:{" "}
                                    {question.answer.passedTestCases ?? "—"}
                                    {" / "}
                                    {question.answer.totalTestCases}
                                  </p>
                                )}
                              {question.type === "WRITTEN" &&
                                attempt?.status === "PENDING_EVALUATION" &&
                                question.answer &&
                                question.answer.text?.trim() &&
                                question.answer.marksObtained === null && (
                                  <WrittenAnswerEvaluation
                                    key={question.answer.id}
                                    answerId={question.answer.id}
                                    maxMarks={question.marks}
                                    disabled={evaluationBusy}
                                    onBusyChange={setEvaluationBusy}
                                    onSaved={() => {
                                      setSuccessMessage(
                                        "Evaluation saved. Refreshing assessment results...",
                                      );
                                      setRefreshKey((value) => value + 1);
                                      onEvaluated?.();
                                    }}
                                  />
                                )}

                              {question.answer?.feedback && (
                                <div className="mt-3 rounded-lg bg-violet-50 p-3">
                                  <p className="text-xs font-semibold text-violet-700">
                                    Evaluation feedback
                                  </p>
                                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                                    {question.answer.feedback}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </details>
                  )}
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
