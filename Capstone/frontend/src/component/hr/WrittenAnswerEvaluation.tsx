import { useRef, useState } from "react";
import axios from "axios";
import { Save, Sparkles } from "lucide-react";
import api from "../../services/api";

interface Props {
  answerId: string;
  maxMarks: number;
  disabled: boolean;
  onBusyChange: (busy: boolean) => void;
  onSaved: () => void;
}

export default function WrittenAnswerEvaluation({
  answerId,
  maxMarks,
  disabled,
  onBusyChange,
  onSaved,
}: Props) {
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState<"manual" | "ai" | null>(null);
  const [error, setError] = useState("");
  const submitting = useRef(false);

  const evaluate = async (mode: "manual" | "ai") => {
    if (disabled || submitting.current) return;

    setError("");

    const numericMarks = Number(marks);

    if (
      mode === "manual" &&
      (marks.trim() === "" ||
        !Number.isFinite(numericMarks) ||
        numericMarks < 0 ||
        numericMarks > maxMarks)
    ) {
      setError(`Enter marks between 0 and ${maxMarks}.`);
      return;
    }

    submitting.current = true;
    setBusy(mode);
    onBusyChange(true);

    let saved = false;

    try {
      if (mode === "manual") {
        await api.patch(`/written-evaluation/${answerId}/manual`, {
          marksObtained: numericMarks,
          feedback: feedback.trim(),
        });
      } else {
        await api.post(`/written-evaluation/${answerId}/ai`);
      }

      saved = true;
    } catch (error: unknown) {
      setError(
        axios.isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message || "Evaluation failed. Try again."
          : "Evaluation failed. Try again.",
      );
    } finally {
      submitting.current = false;
      setBusy(null);
      onBusyChange(false);
    }

    if (saved) onSaved();
  };

  const locked = disabled || busy !== null;

  return (
    <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-4">
      <h4 className="font-semibold text-slate-800">Evaluate Written Answer</h4>

      <p className="mt-1 text-sm text-slate-500">
        Enter marks and feedback, or let AI grade this answer. AI evaluation
        saves the result immediately.
      </p>

      <div className="mt-4 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Marks out of {maxMarks}
          </span>

          <input
            type="number"
            min={0}
            max={maxMarks}
            step="0.01"
            value={marks}
            disabled={locked}
            onChange={(event) => setMarks(event.target.value)}
            placeholder={`0-${maxMarks}`}
            className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-violet-500 disabled:opacity-60 sm:w-40"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Feedback</span>

          <textarea
            rows={3}
            maxLength={5000}
            value={feedback}
            disabled={locked}
            onChange={(event) => setFeedback(event.target.value)}
            placeholder="Explain what was correct and what could improve..."
            className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-violet-500 disabled:opacity-60"
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={locked}
            onClick={() => void evaluate("manual")}
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} aria-hidden="true" />
            {busy === "manual" ? "Saving..." : "Save Evaluation"}
          </button>

          <button
            type="button"
            disabled={locked}
            onClick={() => void evaluate("ai")}
            className="flex items-center gap-2 rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-semibold text-violet-600 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles size={16} aria-hidden="true" />
            {busy === "ai" ? "Evaluating..." : "Evaluate with AI"}
          </button>
        </div>
      </div>
    </div>
  );
}
