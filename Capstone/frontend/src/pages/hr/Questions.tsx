import axios from "axios";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../../services/api";

type QuestionType = "MCQ" | "CODING" | "WRITTEN";

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface Question {
  id: string;
  type: QuestionType;
  question: string;
  marks: number;
  orderNumber: number;
  options: string[] | null;
  correctAnswer: string | null;
  starterCode: string | null;
  testCases: TestCase[] | null;
}

interface Round {
  id: string;
  title: string;
  type: string;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-violet-500";

const buttonClass =
  "rounded-lg bg-violet-600 px-4 py-2 font-medium text-white disabled:opacity-50";

function message(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || "Request failed. Please retry.";
  }
  return error instanceof Error ? error.message : "Something went wrong.";
}

export default function Questions() {
  const { roundId } = useParams();

  // Reset page state if navigation changes the round.
  return roundId ? (
    <RoundQuestions key={roundId} roundId={roundId} />
  ) : (
    <p className="p-6 text-red-600">Round ID is missing.</p>
  );
}

function RoundQuestions({ roundId }: { roundId: string }) {
  const [round, setRound] = useState<Round | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reload, setReload] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);

  // undefined = closed; null = new question; Question = editing.
  const [editing, setEditing] = useState<Question | null | undefined>(
    undefined,
  );
  const navigate = useNavigate();
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const config = {
          signal: controller.signal,
          timeout: 10000,
        };

        const [roundResponse, questionResponse] = await Promise.all([
          api.get(`/interview-round/${roundId}`, config),
          api.get(`/question/round/${roundId}`, config),
        ]);

        if (controller.signal.aborted) return;

        setRound(roundResponse.data.round);
        setQuestions(questionResponse.data.questions || []);
      } catch (error) {
        if (!controller.signal.aborted) setError(message(error));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [roundId, reload]);

  const removeQuestion = async (question: Question) => {
    if (!window.confirm(`Delete Question ${question.orderNumber}?`)) return;

    try {
      setDeleting(question.id);
      setError("");
      setNotice("");

      await api.delete(`/question/${question.id}`, { timeout: 10000 });

      setQuestions((previous) =>
        previous.filter((item) => item.id !== question.id),
      );

      setNotice("Question deleted.");
    } catch (error) {
      setError(message(error));
    } finally {
      setDeleting(null);
    }
  };

  const saveQuestion = (saved: Question) => {
    setQuestions((previous) =>
      [...previous.filter((item) => item.id !== saved.id), saved].sort(
        (a, b) => a.orderNumber - b.orderNumber,
      ),
    );
    setEditing(undefined);
    setNotice("Question saved.");
    setError("");
  };

  const nextOrder =
    Math.max(0, ...questions.map((question) => question.orderNumber)) + 1;

  const totalMarks = questions.reduce(
    (sum, question) => sum + Number(question.marks),
    0,
  );

  return (
    <div className="min-h-screen big-slate-50">
      <main className="mx-auto max-w-7xl px-6 py-8 ">
        <button
          onClick={() => navigate("/interview")}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-violet-600"
        >
          <ArrowLeft size={17} />
          Back to Interview
        </button>
        <header className=" mt-7 mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {round?.title || "Round"} — Questions
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {questions.length} questions · {totalMarks} total marks
            </p>
          </div>

          <button
            disabled={
              loading ||
              !round ||
              round.type === "INTERVIEW" ||
              editing !== undefined ||
              deleting !== null
            }
            onClick={() => {
              setNotice("");
              setEditing(null);
            }}
            className={buttonClass}
          >
            Add Question
          </button>
        </header>

        {error && (
          <div role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
            {error}
            <button
              disabled={editing !== undefined || deleting !== null}
              onClick={() => setReload((previous) => previous + 1)}
              className="ml-3 underline disabled:opacity-50"
            >
              Reload
            </button>
          </div>
        )}

        {notice && (
          <p
            role="status"
            className="rounded-lg bg-green-50 p-3 text-green-700"
          >
            {notice}
          </p>
        )}

        {loading ? (
          <p>Loading questions...</p>
        ) : round?.type === "INTERVIEW" ? (
          <p>Interview-only rounds do not contain assessment questions.</p>
        ) : (
          <>
            {editing !== undefined && (
              <QuestionForm
                key={editing?.id ?? "new"}
                roundId={roundId}
                initial={editing}
                nextOrder={nextOrder}
                questions={questions}
                onSaved={saveQuestion}
                onCancel={() => setEditing(undefined)}
              />
            )}

            {!error && questions.length === 0 && editing === undefined && (
              <p className="rounded-xl border border-dashed p-8 text-center text-slate-500">
                No questions yet. Click Add Question to create one.
              </p>
            )}

            <div className="space-y-4">
              {[...questions]
                .sort((a, b) => a.orderNumber - b.orderNumber)
                .map((question) => (
                  <article
                    key={question.id}
                    className="rounded-xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex flex-wrap justify-between gap-3">
                      <p className="font-semibold text-violet-700">
                        Question {question.orderNumber} · {question.type} ·{" "}
                        {question.marks} marks
                      </p>

                      <div className="flex gap-3">
                        <button
                          disabled={editing !== undefined || deleting !== null}
                          onClick={() => {
                            setNotice("");
                            setEditing(question);
                          }}
                          className="text-blue-600 disabled:opacity-50"
                        >
                          Edit
                        </button>

                        <button
                          disabled={editing !== undefined || deleting !== null}
                          onClick={() => void removeQuestion(question)}
                          className="text-red-600 disabled:opacity-50"
                        >
                          {deleting === question.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 whitespace-pre-wrap">
                      {question.question}
                    </p>

                    {question.type === "MCQ" && (
                      <ul className="mt-3 space-y-2">
                        {question.options?.map((option, index) => (
                          <li
                            key={index}
                            className={
                              option === question.correctAnswer
                                ? "font-medium text-green-700"
                                : "text-slate-600"
                            }
                          >
                            {String.fromCharCode(65 + index)}. {option}
                            {option === question.correctAnswer && " ✓ Correct"}
                          </li>
                        ))}
                      </ul>
                    )}

                    {question.type === "CODING" && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-violet-600">
                          Starter code and {question.testCases?.length ?? 0}{" "}
                          test cases
                        </summary>

                        <pre className="mt-3 overflow-auto rounded-lg bg-slate-950 p-4 text-sm text-white">
                          {question.starterCode || "No starter code"}
                        </pre>

                        {question.testCases?.map((test, index) => (
                          <div key={index} className="mt-2 rounded border p-3">
                            <p className="font-medium">Test {index + 1}</p>
                            <pre className="whitespace-pre-wrap">
                              Input: {test.input}
                            </pre>
                            <pre className="whitespace-pre-wrap">
                              Expected: {test.expectedOutput}
                            </pre>
                          </div>
                        ))}
                      </details>
                    )}
                  </article>
                ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

interface QuestionFormProps {
  roundId: string;
  initial: Question | null;
  nextOrder: number;
  questions: Question[];
  onSaved: (question: Question) => void;
  onCancel: () => void;
}

function QuestionForm({
  roundId,
  initial,
  nextOrder,
  questions,
  onSaved,
  onCancel,
}: QuestionFormProps) {
  const [type, setType] = useState<QuestionType>(initial?.type ?? "MCQ");
  const [text, setText] = useState(initial?.question ?? "");
  const [marks, setMarks] = useState(String(initial?.marks ?? 1));
  const [order, setOrder] = useState(String(initial?.orderNumber ?? nextOrder));
  const [options, setOptions] = useState(initial?.options ?? ["", ""]);
  const [correctIndex, setCorrectIndex] = useState(
    initial?.options?.findIndex((option) => option === initial.correctAnswer) ??
      -1,
  );
  const [starterCode, setStarterCode] = useState(initial?.starterCode ?? "");
  const [tests, setTests] = useState<TestCase[]>(
    initial?.testCases ?? [{ input: "", expectedOutput: "" }],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;

    setError("");

    const numericMarks = Number(marks);
    const numericOrder = Number(order);
    const cleanOptions = options.map((option) => option.trim());

    if (text.trim().length < 2) {
      setError("Enter a question with at least two characters.");
      return;
    }

    if (
      !Number.isInteger(numericMarks) ||
      numericMarks <= 0 ||
      !Number.isInteger(numericOrder) ||
      numericOrder <= 0
    ) {
      setError("Marks and order must be positive whole numbers.");
      return;
    }

    if (
      questions.some(
        (question) =>
          question.id !== initial?.id && question.orderNumber === numericOrder,
      )
    ) {
      setError("That order number is already in use.");
      return;
    }

    if (
      type === "MCQ" &&
      (cleanOptions.length < 2 ||
        cleanOptions.some((option) => !option) ||
        new Set(cleanOptions).size !== cleanOptions.length ||
        correctIndex < 0 ||
        correctIndex >= cleanOptions.length)
    ) {
      setError(
        "Enter at least two distinct options and select the correct one.",
      );
      return;
    }

    if (type === "CODING" && tests.length === 0) {
      setError("Add at least one coding test case.");
      return;
    }

    if (type === "CODING") {
      try {
        tests.forEach((test) => {
          if (!Array.isArray(JSON.parse(test.input))) {
            throw new Error("Invalid arguments");
          }
        });
      } catch {
        setError(
          "Each test input must be a JSON array of arguments, such as [2, 3].",
        );
        return;
      }
    }

    const payload = {
      type,
      question: text.trim(),
      marks: numericMarks,
      orderNumber: numericOrder,
      ...(type === "MCQ" && {
        options: cleanOptions,
        correctAnswer: cleanOptions[correctIndex],
      }),
      ...(type === "CODING" && {
        starterCode,
        testCases: tests,
      }),
    };

    try {
      setSaving(true);

      const response = initial
        ? await api.put(`/question/${initial.id}`, payload, { timeout: 10000 })
        : await api.post(`/question/round/${roundId}`, payload, {
            timeout: 10000,
          });

      onSaved(response.data.question);
    } catch (error) {
      setError(message(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-xl border bg-violet-50/40 p-5">
      <h2 className="mb-4 text-lg font-semibold">
        {initial ? "Edit Question" : "New Question"}
      </h2>

      {error && (
        <p role="alert" className="mb-4 text-red-600">
          {error}
        </p>
      )}

      <fieldset disabled={saving} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <label>
            Type
            <select
              value={type}
              onChange={(event) => setType(event.target.value as QuestionType)}
              className={inputClass}
            >
              <option value="MCQ">MCQ</option>
              <option value="CODING">Coding</option>
              <option value="WRITTEN">Written</option>
            </select>
          </label>

          <label>
            Marks
            <input
              type="number"
              min="1"
              step="1"
              required
              value={marks}
              onChange={(event) => setMarks(event.target.value)}
              className={inputClass}
            />
          </label>

          <label>
            Order
            <input
              type="number"
              min="1"
              step="1"
              required
              value={order}
              onChange={(event) => setOrder(event.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <label className="block">
          Question
          <textarea
            required
            rows={4}
            value={text}
            onChange={(event) => setText(event.target.value)}
            className={inputClass}
          />
        </label>

        {type === "MCQ" && (
          <div className="space-y-3">
            <p className="font-medium">Options — select the correct answer</p>

            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="correct-option"
                  aria-label={`Option ${index + 1} is correct`}
                  checked={correctIndex === index}
                  onChange={() => setCorrectIndex(index)}
                />

                <input
                  required
                  aria-label={`Option ${index + 1}`}
                  value={option}
                  onChange={(event) =>
                    setOptions((previous) =>
                      previous.map((value, position) =>
                        position === index ? event.target.value : value,
                      ),
                    )
                  }
                  className={inputClass}
                />

                <button
                  type="button"
                  disabled={options.length <= 2}
                  onClick={() => {
                    setOptions((previous) =>
                      previous.filter((_, position) => position !== index),
                    );
                    setCorrectIndex((previous) =>
                      previous === index
                        ? -1
                        : previous > index
                          ? previous - 1
                          : previous,
                    );
                  }}
                  className="text-red-600 disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setOptions((previous) => [...previous, ""])}
              className="text-violet-700"
            >
              + Add Option
            </button>
          </div>
        )}

        {type === "CODING" && (
          <div className="space-y-4">
            <label className="block">
              JavaScript starter code
              <textarea
                rows={6}
                spellCheck={false}
                value={starterCode}
                onChange={(event) => setStarterCode(event.target.value)}
                className={`${inputClass} font-mono`}
                placeholder="function solve(a, b) { }"
              />
            </label>

            <p className="text-sm text-slate-600">
              Your evaluator expects a named function declaration. Input is a
              JSON array of arguments: [2,3] calls solve(2,3). For one array
              argument, use [[1,2,3]].
            </p>

            {tests.map((test, index) => (
              <div
                key={index}
                className="space-y-3 rounded-lg border bg-white p-4"
              >
                <p className="font-medium">Test Case {index + 1}</p>

                <label className="block">
                  Input arguments
                  <textarea
                    required
                    value={test.input}
                    onChange={(event) =>
                      setTests((previous) =>
                        previous.map((item, position) =>
                          position === index
                            ? { ...item, input: event.target.value }
                            : item,
                        ),
                      )
                    }
                    placeholder="[2,3]"
                    className={`${inputClass} font-mono`}
                  />
                </label>

                <label className="block">
                  Expected output
                  <textarea
                    value={test.expectedOutput}
                    onChange={(event) =>
                      setTests((previous) =>
                        previous.map((item, position) =>
                          position === index
                            ? { ...item, expectedOutput: event.target.value }
                            : item,
                        ),
                      )
                    }
                    placeholder="5"
                    className={`${inputClass} font-mono`}
                  />
                </label>

                <button
                  type="button"
                  disabled={tests.length <= 1}
                  onClick={() =>
                    setTests((previous) =>
                      previous.filter((_, position) => position !== index),
                    )
                  }
                  className="text-red-600 disabled:opacity-40"
                >
                  Remove Test Case
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                setTests((previous) => [
                  ...previous,
                  { input: "", expectedOutput: "" },
                ])
              }
              className="text-violet-700"
            >
              + Add Test Case
            </button>
          </div>
        )}

        {type === "WRITTEN" && (
          <p className="text-sm text-slate-600">
            Written answers will be evaluated manually or through your AI
            evaluation flow.
          </p>
        )}

        <div className="flex gap-3">
          <button type="submit" className={buttonClass}>
            {saving ? "Saving..." : "Save Question"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </fieldset>
    </form>
  );
}
