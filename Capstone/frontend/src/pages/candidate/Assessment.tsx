import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

interface Question {
  id: string;
  type: "MCQ" | "CODING" | "WRITTEN";
  question: string;
  options: string[] | null;
  starterCode: string | null;
  marks: number;
}

interface Attempt {
  id: string;
  status: string;
  deadline: string | null;
  durationMinutes: number | null;
  tabSwitchCount: number;
  violationCount: number;
}

interface SavedAnswer {
  questionId: string;
  answerText: string;
}

interface AssessmentResponse {
  serverNow?: string;
  attempt: Attempt;
  questions?: Question[];
  answers?: SavedAnswer[];
}

type FinishReason =
  | "MANUAL"
  | "TIME_EXPIRED"
  | "TAB_SWITCH"
  | "CAMERA_DISABLED";

const requestOptions = { timeout: 10000 };

function errorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

export default function Assessment() {
  const { roundId, attemptId: routeAttemptId } = useParams();
  const navigate = useNavigate();

  const [attemptId, setAttemptId] = useState(routeAttemptId);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);

  const [title, setTitle] = useState("Assessment");
  const [duration, setDuration] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  const [loading, setLoading] = useState(Boolean(routeAttemptId || roundId));
  const [starting, setStarting] = useState(false);
  const [active, setActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [moving, setMoving] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [warning, setWarning] = useState("");

  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [retryReason, setRetryReason] = useState<FinishReason | null>(null);

  const tabSwitchCountRef = useRef(0);
  const pendingTabCountRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const answersRef = useRef<Record<string, string>>({});
  const savedRef = useRef<Record<string, string>>({});
  const savePromiseRef = useRef<Promise<void> | null>(null);

  const deadlineRef = useRef<number | null>(null);
  const clockOffsetRef = useRef(0);
  const busyRef = useRef(false);
  const startingRef = useRef(false);
  const activeRef = useRef(false);

  // Automatic reasons survive failed requests while this page remains open.
  const automaticReasonRef = useRef<FinishReason | null>(null);
  const finishRef = useRef<(reason: FinishReason) => Promise<void>>(
    async () => {},
  );

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => {
      track.onended = null;
      track.stop();
    });

    streamRef.current = null;
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  const showResult = useCallback(
    (id: string) => {
      activeRef.current = false;
      stopCamera();
      navigate(`/assessment/${id}/result`, { replace: true });
    },
    [navigate, stopCamera],
  );

  const syncClock = useCallback((data: AssessmentResponse) => {
    // Server time avoids relying directly on the candidate's system clock.
    clockOffsetRef.current = data.serverNow
      ? Date.parse(data.serverNow) - Date.now()
      : 0;

    deadlineRef.current = data.attempt.deadline
      ? Date.parse(data.attempt.deadline)
      : null;

    const deadline = deadlineRef.current;

    setRemaining(
      deadline === null
        ? null
        : Math.max(
            0,
            Math.ceil(
              (deadline - (Date.now() + clockOffsetRef.current)) / 1000,
            ),
          ),
    );

    tabSwitchCountRef.current = Math.max(
      tabSwitchCountRef.current,
      data.attempt.tabSwitchCount ?? 0,
    );

    setTabSwitchCount(tabSwitchCountRef.current);
  }, []);

  const isExpired = useCallback(() => {
    return (
      deadlineRef.current !== null &&
      Date.now() + clockOffsetRef.current >= deadlineRef.current
    );
  }, []);

  // Load round instructions without starting the timer.
  useEffect(() => {
    if (!roundId || attemptId) return;

    let cancelled = false;

    const loadRound = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(
          `/interview-round/${roundId}`,
          requestOptions,
        );

        if (!cancelled) {
          setTitle(data.round.title);
          setDuration(data.round.durationMinutes);
        }
      } catch (error) {
        if (!cancelled) {
          setError(errorMessage(error, "Unable to load assessment."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadRound();

    return () => {
      cancelled = true;
    };
  }, [roundId, attemptId]);

  // Restore server-saved answers when opening an existing attempt.
  useEffect(() => {
    if (!attemptId) return;

    let cancelled = false;

    const loadAttempt = async () => {
      try {
        setLoading(true);

        const { data } = await api.get<AssessmentResponse>(
          `/assessment/${attemptId}`,
          requestOptions,
        );

        if (cancelled) return;

        if (data.attempt.status !== "IN_PROGRESS") {
          showResult(attemptId);
          return;
        }

        const loadedQuestions = data.questions ?? [];
        const restored: Record<string, string> = {};
        const persisted: Record<string, string> = {};

        loadedQuestions.forEach((question) => {
          restored[question.id] = question.starterCode ?? "";
          persisted[question.id] = "";
        });

        (data.answers ?? []).forEach((answer) => {
          restored[answer.questionId] = answer.answerText;
          persisted[answer.questionId] = answer.answerText;
        });

        answersRef.current = restored;
        savedRef.current = persisted;

        setAnswers(restored);
        setQuestions(loadedQuestions);
        setAttempt(data.attempt);
        setDuration(data.attempt.durationMinutes);
        syncClock(data);

        if (!loadedQuestions.length) {
          setError("No questions were returned for this assessment.");
          return;
        }

        if (
          streamRef.current
            ?.getVideoTracks()
            .some((track) => track.readyState === "live")
        ) {
          await api.patch(
            `/assessment/${attemptId}/camera`,
            { enabled: true },
            requestOptions,
          );

          if (!cancelled) {
            activeRef.current = true;
            setActive(true);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setError(errorMessage(error, "Unable to load assessment."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadAttempt();

    return () => {
      cancelled = true;
    };
  }, [attemptId, showResult, syncClock]);

  const flushAnswers = useCallback((): Promise<void> => {
    if (!attemptId) return Promise.resolve();
    if (savePromiseRef.current) return savePromiseRef.current;

    const save = async () => {
      try {
        while (true) {
          const dirty = Object.entries(answersRef.current).filter(
            ([id, value]) => savedRef.current[id] !== value,
          );

          if (!dirty.length) {
            setSaveStatus("Saved");
            return;
          }

          if (isExpired()) {
            throw new Error(
              "Time expired. Only answers received before the deadline can be scored.",
            );
          }

          setSaveStatus("Saving...");

          for (const [questionId, answerText] of dirty) {
            await api.post(
              `/assessment/${attemptId}/answers`,
              { questionId, answerText },
              requestOptions,
            );

            // Record exactly what the server acknowledged.
            savedRef.current[questionId] = answerText;
          }
        }
      } catch (error) {
        setSaveStatus("Save failed — retrying while time remains");
        throw error;
      }
    };

    const promise = save().finally(() => {
      savePromiseRef.current = null;
    });

    savePromiseRef.current = promise;
    return promise;
  }, [attemptId, isExpired]);

  const verifySubmitted = useCallback(async () => {
    if (!attemptId) return false;

    const { data } = await api.get<AssessmentResponse>(
      `/assessment/${attemptId}`,
      requestOptions,
    );

    if (data.attempt.status !== "IN_PROGRESS") {
      showResult(attemptId);
      return true;
    }

    syncClock(data);
    return false;
  }, [attemptId, showResult, syncClock]);

  const finish = useCallback(
    async (requestedReason: FinishReason) => {
      if (!attemptId || busyRef.current) return;

      if (requestedReason !== "MANUAL") {
        automaticReasonRef.current ??= requestedReason;
      }

      const reason = automaticReasonRef.current ?? requestedReason;

      busyRef.current = true;
      setSubmitting(true);
      setError("");

      try {
        if (reason === "MANUAL") {
          // Do not submit manually if saving fails.
          await flushAnswers();
        } else if (reason !== "TIME_EXPIRED") {
          try {
            await flushAnswers();
          } catch {
            // Previously acknowledged answers remain on the server.
          }
        }

        if (reason === "TAB_SWITCH" || reason === "CAMERA_DISABLED") {
          if (reason === "TAB_SWITCH") {
            // Keep the same count if this request needs to be retried.
            pendingTabCountRef.current ??= Math.min(
              tabSwitchCountRef.current + 1,
              3,
            );
          }

          const response = await api.post<{
            submitted: boolean;
            message: string;
            violation?: {
              tabSwitchCount: number;
              violationCount: number;
            };
          }>(
            `/assessment/${attemptId}/violation`,
            {
              type: reason,
              ...(reason === "TAB_SWITCH"
                ? { tabSwitchCount: pendingTabCountRef.current }
                : {}),
            },
            requestOptions,
          );
          if (response.data.violation) {
            tabSwitchCountRef.current = response.data.violation.tabSwitchCount;

            setTabSwitchCount(tabSwitchCountRef.current);
          }

          if (!response.data.submitted) {
            setWarning(response.data.message);

            pendingTabCountRef.current = null;
            automaticReasonRef.current = null;
            setRetryReason(null);

            // Continue the assessment after warning one or two.
            return;
          }
        } else {
          await api.post(`/assessment/${attemptId}/submit`, {}, requestOptions);
        }

        showResult(attemptId);
      } catch (error) {
        // A lost response or server expiry may mean submission already happened.
        try {
          if (await verifySubmitted()) return;
        } catch {
          // Show recovery controls if status cannot be verified either.
        }

        setError(
          errorMessage(
            error,
            "Unable to confirm submission. Check your connection and retry.",
          ),
        );

        setRetryReason(reason);
      } finally {
        busyRef.current = false;
        setSubmitting(false);
      }
    },
    [attemptId, flushAnswers, showResult, verifySubmitted],
  );

  useEffect(() => {
    finishRef.current = finish;
  }, [finish]);

  // Autosave at a fixed interval, including during continuous typing.
  useEffect(() => {
    if (!active || !attemptId) return;

    const save = () => {
      if (busyRef.current || automaticReasonRef.current || isExpired()) {
        return;
      }

      void flushAnswers().catch(() => {
        // Save status already explains the failure. The next tick retries.
      });
    };

    const interval = window.setInterval(save, 1000);
    window.addEventListener("online", save);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("online", save);
    };
  }, [active, attemptId, flushAnswers, isExpired]);

  // Calculate from the deadline instead of subtracting one every second.
  useEffect(() => {
    if (!attempt) return;

    const tick = () => {
      if (deadlineRef.current === null) return;

      const seconds = Math.max(
        0,
        Math.ceil(
          (deadlineRef.current - (Date.now() + clockOffsetRef.current)) / 1000,
        ),
      );

      setRemaining(seconds);

      if (seconds === 0 && !automaticReasonRef.current) {
        automaticReasonRef.current = "TIME_EXPIRED";
        void finishRef.current("TIME_EXPIRED");
      }
    };

    tick();

    const interval = window.setInterval(tick, 250);

    return () => window.clearInterval(interval);
  }, [attempt]);

  // Keep server status current without overwriting local answers.
  useEffect(() => {
    if (!attemptId || !attempt) return;

    let checking = false;

    const check = async () => {
      if (checking || busyRef.current) return;
      checking = true;

      try {
        await verifySubmitted();
      } catch {
        // Keep the current deadline during temporary network failures.
      } finally {
        checking = false;
      }
    };

    const interval = window.setInterval(() => void check(), 15000);
    const reconnect = () => {
      const reason = automaticReasonRef.current;

      if (reason) {
        void finishRef.current(reason);
      } else {
        void check();
      }
    };

    window.addEventListener("online", reconnect);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("online", reconnect);
    };
  }, [attemptId, attempt, verifySubmitted]);

  // Retry failed automatic submissions without allowing further editing.
  useEffect(() => {
    if (!retryReason || retryReason === "MANUAL") return;

    const interval = window.setInterval(() => {
      void finishRef.current(retryReason);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [retryReason]);

  useEffect(() => {
    if (!active) return;

    const onVisibilityChange = () => {
      if (document.hidden && !busyRef.current) {
        void finishRef.current("TAB_SWITCH");
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [active]);

  // Warn before closing/reloading with answers that are not acknowledged.
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      const dirty = Object.entries(answersRef.current).some(
        ([id, value]) => savedRef.current[id] !== value,
      );

      if (dirty || busyRef.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, []);

  const enableCamera = async () => {
    try {
      setError("");
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;
      stream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          setCameraReady(false);

          if (activeRef.current) {
            void finishRef.current("CAMERA_DISABLED");
          }
        };
      });

      setCameraReady(true);
    } catch (error) {
      setCameraReady(false);
      setError(errorMessage(error, "Allow camera access before starting."));
    }
  };

  const begin = async () => {
    if (startingRef.current) return;

    const liveCamera = streamRef.current
      ?.getVideoTracks()
      .some((track) => track.readyState === "live");

    if (!liveCamera) {
      setError("Enable your camera before starting.");
      return;
    }

    startingRef.current = true;
    setStarting(true);
    setError("");

    try {
      if (attemptId) {
        if (await verifySubmitted()) return;

        if (!questions.length) {
          throw new Error("Reload the page to load your assessment questions.");
        }
        await api.patch(
          `/assessment/${attemptId}/camera`,
          { enabled: true },
          requestOptions,
        );
        activeRef.current = true;
        setActive(true);
        return;
      }

      if (!roundId) {
        throw new Error("Assessment round ID is missing.");
      }

      // The server starts the timer here, after instructions/camera preparation.
      const { data } = await api.post(
        `/assessment/round/${roundId}/start`,
        {},
        requestOptions,
      );

      if (data.attempt.status !== "IN_PROGRESS") {
        showResult(data.attempt.id);
        return;
      }

      // Keep this component mounted so its camera stream remains available.
      // The attempt-loading effect fetches questions and enables the session.
      setAttemptId(data.attempt.id);
    } catch (error) {
      setError(errorMessage(error, "Unable to start assessment."));
    } finally {
      startingRef.current = false;
      setStarting(false);
    }
  };

  const changeAnswer = (questionId: string, value: string) => {
    if (busyRef.current || automaticReasonRef.current || isExpired()) return;

    const next = {
      ...answersRef.current,
      [questionId]: value,
    };

    answersRef.current = next;
    setAnswers(next);
    setSaveStatus("Unsaved changes");
  };

  const moveTo = async (index: number) => {
    if (moving || busyRef.current || automaticReasonRef.current) return;

    setMoving(true);

    try {
      await flushAnswers();

      if (!automaticReasonRef.current && !isExpired()) {
        setCurrent(index);
        setError("");
      }
    } catch (error) {
      setError(errorMessage(error, "Save failed. Please retry."));
    } finally {
      setMoving(false);
    }
  };

  const manualSubmit = () => {
    if (
      window.confirm(
        "Submit your assessment? You cannot edit answers after submission.",
      )
    ) {
      void finish("MANUAL");
    }
  };

  const question = questions[current];
  const frozen =
    submitting ||
    moving ||
    remaining === 0 ||
    automaticReasonRef.current !== null;

  const timeText =
    remaining === null
      ? duration
        ? `${duration} minutes`
        : "No time limit"
      : `${Math.floor(remaining / 60)
          .toString()
          .padStart(2, "0")}:${(remaining % 60).toString().padStart(2, "0")}`;

  if (loading) {
    return <p className="p-8">Loading assessment...</p>;
  }

  return (
    <main className="mx-auto max-w-7xl space-y-5 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{title}</h1>

        <p
          className={
            remaining !== null && remaining <= 300
              ? "font-bold text-red-600"
              : "font-semibold"
          }
        >
          {timeText}
        </p>
      </header>
      {active && warning && tabSwitchCount > 0 && tabSwitchCount < 3 && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="tab-warning-title"
            aria-describedby="tab-warning-description"
            className="w-full max-w-md rounded-xl border border-amber-300 bg-white p-6 shadow-xl"
          >
            <h2
              id="tab-warning-title"
              className="text-lg font-bold text-amber-800"
            >
              Tab switch warning {tabSwitchCount}/2
            </h2>
            <p
              id="tab-warning-description"
              className="mt-3 text-sm text-slate-700"
            >
              {warning} The third tab switch automatically submits your
              assessment. Your timer continues while this warning is open.
            </p>
            <button
              type="button"
              autoFocus
              onClick={() => setWarning("")}
              className="mt-5 rounded-lg bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-700"
            >
              I understand
            </button>
          </div>
        </div>
      )}

      {active && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-semibold text-amber-800">
            Tab switches: {tabSwitchCount}/3
          </p>

          <p className="mt-1 text-sm text-amber-700">
            The third tab switch automatically submits this assessment.
          </p>

          {warning && (
            <p role="alert" className="mt-2 text-sm font-medium text-amber-900">
              {warning}
            </p>
          )}
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {retryReason && (
        <button
          disabled={submitting}
          onClick={() => void finish(retryReason)}
          className="rounded-lg bg-amber-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {submitting ? "Checking submission..." : "Retry submission"}
        </button>
      )}

      <video
        ref={(element) => {
          if (element && element.srcObject !== streamRef.current) {
            element.srcObject = streamRef.current;
          }
        }}
        autoPlay
        playsInline
        muted
        className="aspect-video w-56 rounded-xl bg-slate-900"
      />

      {!active ? (
        <section className="space-y-4 rounded-xl border p-6">
          <h2 className="text-lg font-semibold">Before you begin</h2>

          <ul className="list-disc space-y-2 pl-5 text-slate-600">
            <li>Keep your camera enabled throughout the assessment.</li>
            <li>
              The first two tab switches show warnings. The third automatically
              submits your assessment.
            </li>
            <li>Answers are saved automatically while you work.</li>
            <li>The assessment submits when its time expires.</li>
          </ul>

          {attemptId && (
            <p className="text-amber-700">
              This attempt has already started. Its timer continues while you
              reconnect your camera.
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              disabled={starting || submitting}
              onClick={() => void enableCamera()}
              className="rounded-lg border px-4 py-2"
            >
              {cameraReady ? "Reconnect Camera" : "Enable Camera"}
            </button>

            <button
              disabled={!cameraReady || starting || frozen}
              onClick={() => void begin()}
              className="rounded-lg bg-violet-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {starting
                ? "Starting..."
                : attemptId
                  ? "Continue Assessment"
                  : "Start Assessment"}
            </button>
          </div>
        </section>
      ) : question ? (
        <>
          <div className="flex flex-wrap gap-2">
            {questions.map((item, index) => (
              <button
                key={item.id}
                disabled={frozen}
                onClick={() => void moveTo(index)}
                className={`rounded-lg border px-3 py-2 ${
                  index === current ? "bg-violet-600 text-white" : "bg-white"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <fieldset
            disabled={frozen}
            className="space-y-4 rounded-xl border p-4 disabled:opacity-70"
          >
            <legend className="px-2 font-semibold">
              Question {current + 1} of {questions.length}
            </legend>

            <p className="text-sm text-slate-500">
              {question.type} · {question.marks} marks
            </p>

            <p className="whitespace-pre-wrap font-medium">
              {question.question}
            </p>

            {question.type === "MCQ" ? (
              <div className="space-y-3">
                {question.options?.map((option, index) => (
                  <label
                    key={`${question.id}-${index}`}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <input
                      type="radio"
                      name={question.id}
                      checked={answers[question.id] === option}
                      onChange={() => changeAnswer(question.id, option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                value={answers[question.id] ?? ""}
                onChange={(event) =>
                  changeAnswer(question.id, event.target.value)
                }
                spellCheck={question.type !== "CODING"}
                placeholder={
                  question.type === "CODING"
                    ? "Write your JavaScript solution..."
                    : "Write your answer..."
                }
                className={`min-h-72 w-full rounded-lg border p-4 ${
                  question.type === "CODING"
                    ? "bg-slate-950 font-mono text-white"
                    : "bg-white"
                }`}
              />
            )}
          </fieldset>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              disabled={frozen || current === 0}
              onClick={() => void moveTo(current - 1)}
              className="rounded-lg border px-4 py-2 disabled:opacity-50"
            >
              Previous
            </button>

            <span role="status" className="text-sm text-slate-500">
              {saveStatus}
            </span>

            <button
              disabled={frozen || current === questions.length - 1}
              onClick={() => void moveTo(current + 1)}
              className="rounded-lg border px-4 py-2 disabled:opacity-50"
            >
              Next
            </button>
          </div>

          <button
            disabled={frozen}
            onClick={manualSubmit}
            className="rounded-lg bg-violet-600 px-5 py-3 text-white disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Assessment"}
          </button>
        </>
      ) : (
        <p>No questions are available. Reload the page to retry.</p>
      )}
    </main>
  );
}
