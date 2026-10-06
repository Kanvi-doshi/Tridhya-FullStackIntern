import { Clock3, Edit3, Plus, Target, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export interface InterviewRound {
  id: string;
  roundNumber: number;
  title: string;
  type: string;
  description: string | null;
  durationMinutes: number | null;
  passingScore: number | null;
  isActive: boolean;
}

interface InterviewRoundsProps {
  rounds: InterviewRound[];
  onAdd: () => void;
  onEdit: (round: InterviewRound) => void;
  onDelete: (id: string) => void;
}

const InterviewRounds = ({
  rounds,
  onAdd,
  onEdit,
  onDelete,
}: InterviewRoundsProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-bold text-slate-800">Interview Rounds</h2>

          <p className="mt-1 text-sm text-slate-400">
            Configure interview stages for the selected job
          </p>
        </div>

        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          <Plus size={16} />
          Add Round
        </button>
      </div>

      {/* EMPTY */}

      {rounds.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <Clock3 size={36} className="mx-auto text-slate-300" />

          <h3 className="mt-4 font-semibold text-slate-700">
            No interview rounds
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Create the first interview round for this job.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 p-6 lg:grid-cols-2">
          {rounds.map((round) => (
            <div
              key={round.id}
              className="rounded-xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-violet-500">
                    Round {round.roundNumber}
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-slate-800">
                    {round.title}
                  </h3>

                  <p className="mt-1 text-xs font-medium text-slate-400">
                    {round.type}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    round.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {round.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {round.description && (
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  {round.description}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-4">
                {round.durationMinutes !== null && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock3 size={15} />
                    {round.durationMinutes} min
                  </div>
                )}

                {round.passingScore !== null && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Target size={15} />
                    {round.passingScore}% passing
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                {round.type !== "INTERVIEW" && (
                  <Link
                    to={`/round/${round.id}/questions`}
                    className="rounded-lg bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-600 hover:bg-violet-100"
                  >
                    Manage Questions
                  </Link>
                )}
                <button
                  onClick={() => onEdit(round)}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                >
                  <Edit3 size={14} />
                  Edit
                </button>

                <button
                  onClick={() => onDelete(round.id)}
                  className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewRounds;
