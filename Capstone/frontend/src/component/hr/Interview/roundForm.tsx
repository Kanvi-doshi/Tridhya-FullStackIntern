import { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

interface Round {
  id: string;
  roundNumber: number;
  title: string;
  type: string;
  description: string | null;
  durationMinutes: number | null;
  passingScore: number | null;
  isActive: boolean;
}

interface Props {
  round?: Round | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

const RoundForm = ({ round, onClose, onSave }: Props) => {
  const [roundNumber, setRoundNumber] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("INTERVIEW");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [passingScore, setPassingScore] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (round) {
      setRoundNumber(String(round.roundNumber));
      setTitle(round.title);
      setType(round.type);
      setDescription(round.description || "");
      setDuration(round.durationMinutes ? String(round.durationMinutes) : "");
      setPassingScore(
        round.passingScore !== null ? String(round.passingScore) : "",
      );
      setIsActive(round.isActive);
    }
  }, [round]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving) return;

    try {
      setSaving(true);
      setError("");

      await onSave({
        roundNumber: Number(roundNumber),
        title,
        type,
        description: description || undefined,

        durationMinutes: duration ? Number(duration) : undefined,

        passingScore: passingScore ? Number(passingScore) : undefined,

        isActive,
      });

      onClose();
    } catch (error: unknown) {
      setError(
        axios.isAxiosError<{
          message?: string;
          errors?: { field: string; message: string }[];
        }>(error)
          ? error.response?.data?.errors
              ?.map((issue) => `${issue.field}: ${issue.message}`)
              .join("; ") ||
            error.response?.data?.message ||
            "Failed to save interview round."
          : "Failed to save interview round.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {round ? "Edit Round" : "Create Round"}
            </h2>

            <p className="text-sm text-slate-400">
              Configure the interview stage
            </p>
          </div>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-2">
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}
          <input
            type="number"
            min="1"
            required
            placeholder="Round Number"
            value={roundNumber}
            onChange={(e) => setRoundNumber(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

          <input
            required
            placeholder="Round Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border p-3"
          >
            <option value="INTERVIEW">Interview</option>
            <option value="WRITTEN">Written</option>
            <option value="CODING">Coding</option>
            <option value="MCQ">MCQ</option>
          </select>

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

          <input
            type="number"
            placeholder="Duration in minutes"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

          <input
            type="number"
            min="0"
            max="100"
            placeholder="Passing Score"
            value={passingScore}
            onChange={(e) => setPassingScore(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active Round
          </label>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2"
            >
              Cancel
            </button>

            <button
              disabled={saving}
              className="rounded-lg bg-violet-600 px-4 py-2 text-white"
            >
              {saving ? "Saving..." : round ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoundForm;
