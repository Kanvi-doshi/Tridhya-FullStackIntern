import {
  ArrowLeft,
  BriefcaseBusiness,
  MessageSquareText,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getErrorMessage,
  useInterviewerFeedback,
} from "../../component/hooks/queries";

interface FeedbackItem {
  id: string;
  technicalRating: number;
  communicationRating: number;
  problemSolvingRating: number;
  overallRating: number;

  strengths: string | null;
  weaknesses: string | null;
  comments: string | null;
  recommendation: string;

  createdAt: string;

  assignment: {
    application: {
      candidate: {
        id: string;
        name: string;
        email: string;
      };

      job: {
        id: string;
        title: string;
      };
    };

    round: {
      id: string;
      name?: string;
      title?: string;
      roundNumber?: number;
    };
  };
}

const InterviewerFeedback = () => {
  const navigate = useNavigate();
  const {
    data: feedback = [],
    isLoading: loading,
    error: loadError,
  } = useInterviewerFeedback<FeedbackItem>();
  const error = loadError
    ? getErrorMessage(loadError, "Failed to load feedback")
    : "";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-violet-600"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-xl font-bold">Feedback History</h1>

            <p className="text-sm text-violet-100">
              Your submitted candidate evaluations
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {feedback.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <MessageSquareText size={38} className="mx-auto text-slate-300" />

            <p className="mt-3 font-semibold text-slate-600">
              No feedback submitted
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Your completed interview evaluations will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {feedback.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-slate-800">
                      {item.assignment?.application?.candidate?.name}
                    </h2>

                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                      <BriefcaseBusiness size={14} />

                      {item.assignment?.application?.job?.title}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400">Overall</p>

                    <p className="text-xl font-bold text-violet-600">
                      {Number(item.overallRating).toFixed(1)}/5
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <Rating label="Technical" value={item.technicalRating} />

                  <Rating
                    label="Communication"
                    value={item.communicationRating}
                  />

                  <Rating
                    label="Problem Solving"
                    value={item.problemSolvingRating}
                  />
                </div>

                <div className="mt-5 rounded-xl bg-violet-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-violet-500">
                    Recommendation
                  </p>

                  <p className="mt-1 font-semibold text-violet-700">
                    {item.recommendation}
                  </p>
                </div>

                {item.comments && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-slate-400">
                      COMMENTS
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {item.comments}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const Rating = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-xl bg-slate-50 p-3 text-center">
    <p className="text-xs text-slate-400">{label}</p>

    <div className="mt-2 flex items-center justify-center gap-1">
      <Star size={14} className="text-violet-600" />

      <span className="font-bold text-slate-700">{value}/5</span>
    </div>
  </div>
);

export default InterviewerFeedback;
