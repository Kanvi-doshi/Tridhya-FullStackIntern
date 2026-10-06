import { ArrowLeft, MessageSquareText, Send } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { HRRealtimeContext } from "../../context/RealtimeContext";
import type { InterviewResponse } from "./InterviewDetails";

const SubmitFeedback = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const revision = useContext(HRRealtimeContext);
  const [availability, setAvailability] = useState<InterviewResponse | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [checkedKey, setCheckedKey] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");
  const requestKey = `${id}:${revision}:${refreshKey}`;

  useEffect(() => {
    let cancelled = false;
    api.get<InterviewResponse>(`/interviewer/interviews/${id}`)
      .then(({ data }) => {
        if (!cancelled) {
          setAvailability(data);
          setAvailabilityError("");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAvailability(null);
          setAvailabilityError("Unable to load this interview or it is no longer assigned to you.");
        }
      })
      .finally(() => {
        if (!cancelled) setCheckedKey(requestKey);
      });
    return () => { cancelled = true; };
  }, [id, requestKey]);

  const [technicalRating, setTechnicalRating] = useState(3);
  const [communicationRating, setCommunicationRating] = useState(3);
  const [problemSolvingRating, setProblemSolvingRating] = useState(3);

  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [comments, setComments] = useState("");
  const [recommendation, setRecommendation] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting || checkedKey !== requestKey || !availability?.canSubmitFeedback) return;

    if (!recommendation) {
      setError("Please select a recommendation");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await api.post(`/interview-feedback/assignment/${id}`, {
        technicalRating,
        communicationRating,
        problemSolvingRating,
        strengths: strengths || undefined,
        weaknesses: weaknesses || undefined,
        comments: comments || undefined,
        recommendation,
      });

      navigate(`/interview/${id}`, { replace: true });
    } catch (error: any) {
      console.error("Failed to submit feedback:", error);

      setError(error.response?.data?.message || "Failed to submit feedback");
      setRefreshKey((value) => value + 1);
    } finally {
      setSubmitting(false);
    }
  };

  if (checkedKey !== requestKey || !availability?.canSubmitFeedback) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="font-bold text-slate-800">Interview Feedback</h1>
          <p className="mt-3 text-sm text-slate-600">
            {checkedKey !== requestKey
              ? "Checking feedback availability..."
              : availabilityError || availability?.feedbackMessage || "Feedback is unavailable."}
          </p>
          <div className="mt-5 flex gap-3">
            <button type="button" onClick={() => navigate(`/interview/${id}`)}
              className="rounded-lg bg-violet-600 px-4 py-2 text-white">
              {availability?.feedback ? "View Submitted Feedback" : "Back to Interview"}
            </button>
            <button type="button" onClick={() => setRefreshKey((value) => value + 1)}
              disabled={checkedKey !== requestKey}
              className="rounded-lg border border-violet-200 px-4 py-2 text-violet-600 disabled:opacity-50">
              Refresh Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-6">
          <button
            onClick={() => navigate(`/interview/${id}`)}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-violet-600"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-xl font-bold">Interview Feedback</h1>

            <p className="text-sm text-violet-100">
              Evaluate the candidate's interview performance
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <MessageSquareText size={19} />
            </div>

            <div>
              <h2 className="font-bold text-slate-800">Candidate Evaluation</h2>

              <p className="text-sm text-slate-400">
                Rate the candidate from 1 to 5
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <fieldset disabled={submitting}>
          <div className="grid gap-5 sm:grid-cols-3">
            <RatingField
              label="Technical"
              value={technicalRating}
              onChange={setTechnicalRating}
            />

            <RatingField
              label="Communication"
              value={communicationRating}
              onChange={setCommunicationRating}
            />

            <RatingField
              label="Problem Solving"
              value={problemSolvingRating}
              onChange={setProblemSolvingRating}
            />
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <TextArea
              label="Strengths"
              value={strengths}
              onChange={setStrengths}
              placeholder="Candidate strengths..."
            />

            <TextArea
              label="Weaknesses"
              value={weaknesses}
              onChange={setWeaknesses}
              placeholder="Areas for improvement..."
            />
          </div>

          <div className="mt-5">
            <TextArea
              label="Comments"
              value={comments}
              onChange={setComments}
              placeholder="Additional interview comments..."
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Recommendation
            </label>

            <select
              value={recommendation}
              onChange={(event) => setRecommendation(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            >
              <option value="">Select recommendation</option>

              <option value="STRONGLY_RECOMMEND">Strongly Recommend</option>
              <option value="RECOMMEND">Recommend</option>
              <option value="NEUTRAL">Neutral</option>
              <option value="NOT_RECOMMEND">Do Not Recommend</option>
            </select>
          </div>

          <div className="mt-7 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
            >
              <Send size={16} />

              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
          </fieldset>
        </form>
      </main>
    </div>
  );
};

const RatingField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label}
    </label>

    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold transition ${
            rating === value
              ? "border-violet-600 bg-violet-600 text-white"
              : "border-slate-200 text-slate-500 hover:border-violet-300"
          }`}
        >
          {rating}
        </button>
      ))}
    </div>
  </div>
);

const TextArea = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label}
    </label>

    <textarea
      rows={4}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
    />
  </div>
);

export default SubmitFeedback;
