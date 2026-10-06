import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Code2,
  FileText,
  ShieldAlert,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { HRRealtimeContext } from "../../context/RealtimeContext";

interface AssessmentResultData {
  id: string;
  status: string;
  totalMarks: number | null;
  obtainedMarks: number | null;
  score: number | null;
  startedAt: string | null;
  submittedAt: string | null;
  autoSubmitted: boolean;
  autoSubmitReason: string | null;
  violationCount: number;
  tabSwitchCount: number;
}

interface AnswerResult {
  id: string;
  questionId: string;
  question: string;
  type: string;
 answerText: string | null;
  isCorrect: boolean | null;
  marksObtained: number | null;
  passedTestCases: number | null;
  totalTestCases: number | null;
}

const AssessmentResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const revision = useContext(HRRealtimeContext);
  const [result, setResult] = useState<AssessmentResultData | null>(null);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);
 const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchResult = async () => {
      if (!attemptId) {
        setError("Assessment attempt ID is missing");
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/assessment/${attemptId}/result`);
        if (cancelled) return;
        setResult(response.data.result);
        setAnswers(response.data.answers || []);
      } catch (error: any) {
        if (cancelled) return;
        console.error("Failed to load result:", error);
        setError(
          error.response?.data?.message || "Failed to load assessment result",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchResult();
    return () => { cancelled = true; };
  }, [attemptId, revision]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          <p className="mt-4 text-sm text-slate-500">Loading result...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center">
          <XCircle size={38} className="mx-auto text-red-500" />
          <h2 className="mt-4 text-lg font-bold text-slate-800">
            Unable to load result
          </h2>
          <p className="mt-2 text-sm text-slate-500">{error}</p>

          <button
            onClick={() => navigate("/application")}
            className="mt-6 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Applications
          </button>
        </div>
      </div>
    );
  }

  const score = result.score !== null ? Number(result.score) : null;
  const pending = result.status === "PENDING_EVALUATION";
  const passed = result.status === "PASSED";
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white">
              <Sparkles size={19} />
            </div>
            <h1 className="text-lg font-bold text-slate-800">SmartHire AI</h1>
          </div>
          <button
            onClick={() => navigate("/application")}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Applications
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* RESULT HERO */}
        <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
              pending
                ? "bg-amber-100 text-amber-600"
                : passed
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-500"
            }`}
          >
            {pending ? (
              <Clock3 size={30} />
            ) : passed ? (
              <Trophy size={30} />
            ) : (
              <XCircle size={30} />
            )}
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-800">
            {pending
              ? "Evaluation Pending"
              : passed
                ? "Assessment Passed"
                : "Assessment Completed"}
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
            {pending
              ? "Your objective answers have been evaluated. Written responses are waiting for evaluation."
              : "Your assessment has been evaluated successfully."}
          </p>
          {score !== null && (
            <div className="mt-7">
              <p className="text-5xl font-bold text-violet-600">
                {score.toFixed(1)}%
              </p>
              <p className="mt-2 text-xs text-slate-400">Assessment Score</p>
            </div>
          )}
        </div>

        {/* STATS */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <ResultCard
            title="Obtained Marks"
            value={
              result.obtainedMarks !== null
                ? String(result.obtainedMarks)
                : "Pending"
            }
          />
          <ResultCard
            title="Total Marks"
            value={result.totalMarks !== null ? String(result.totalMarks) : "-"}
          />
          <ResultCard title="Status" value={result.status} />
        </div>

        {/* AUTO SUBMISSION */}
        {result.autoSubmitted && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <ShieldAlert
                size={21}
                className="mt-0.5 shrink-0 text-amber-600"
              />
              <div>
                <h3 className="font-semibold text-amber-800">
                  Assessment Automatically Submitted
                </h3>
                <p className="mt-1 text-sm text-amber-700">
                  Reason: {formatReason(result.autoSubmitReason)}
                </p>
                {result.tabSwitchCount > 0 && (
                  <p className="mt-1 text-xs text-amber-600">
                    Tab switch count: {result.tabSwitchCount}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ANSWERS */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="font-bold text-slate-800">Answer Summary</h2>
            <p className="mt-1 text-sm text-slate-400">
              Review your submitted responses
            </p>
          </div>

          {answers.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No answers submitted.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {answers.map((answer, index) => (
                <div key={answer.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-xs font-bold text-violet-600">
                        {index + 1}
                      </div>

                      <div>
                        <p className="font-medium leading-6 text-slate-700">
                          {answer.question}
                        </p>
                        <QuestionLabel type={answer.type} />
                      </div>
                    </div>

                    {answer.isCorrect !== null && (
                      <div>
                        {answer.isCorrect ? (
                          <CheckCircle2 size={20} className="text-green-500" />
                        ) : (
                          <XCircle size={20} className="text-red-400" />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Your Answer
                    </p>

                    <pre className="mt-2 whitespace-pre-wrap break-words font-sans text-sm leading-6 text-slate-600">
                      {answer.answerText || "No answer submitted"}
                    </pre>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
                    <span>
                      Marks:{" "}
                      {answer.marksObtained !== null
                        ? answer.marksObtained
                        : "Pending"}
                    </span>

                    {answer.type === "CODING" &&
                      answer.totalTestCases !== null && (
                        <span>
                          Test Cases: {answer.passedTestCases}/
                          {answer.totalTestCases}
                        </span>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-7 flex justify-center">
          <button
            onClick={() => navigate("/application")}
            className="rounded-lg bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            Back to Applications
          </button>
        </div>
      </main>
    </div>
  );
};

const ResultCard = ({ title, value }: { title: string; value: string }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 break-words text-xl font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
};

const QuestionLabel = ({ type }: { type: string }) => {
  return (
    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
      {type === "CODING" ? <Code2 size={13} /> : <FileText size={13} />}
      {type}
    </div>
  );
};

const formatReason = (reason: string | null) => {
  switch (reason) {
    case "TAB_SWITCH":
      return "Browser tab was changed";
    case "CAMERA_VIOLATION":
      return "Camera was disabled";
    case "TIME_EXPIRED":
      return "Assessment time expired";
    default:
      return reason || "Automatic submission";
  }
};

export default AssessmentResult;