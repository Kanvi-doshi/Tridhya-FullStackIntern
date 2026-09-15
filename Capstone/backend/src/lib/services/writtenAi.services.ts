import { getGemini } from "../config/gemini";

interface WrittenEvaluationResult {
  marksObtained: number;
  feedback: string;
}

export const evaluateWrittenWithAI = async (
  question: string,
  answer: string,
  maxMarks: number,
): Promise<WrittenEvaluationResult> => {
  const gemini = await getGemini();

  const prompt = `
Evaluate this written assessment answer.

Question:
${question}

Candidate Answer:
${answer}

Maximum Marks:
${maxMarks}

Evaluate based on correctness, relevance and completeness.
Do not give marks greater than ${maxMarks}.
`;

  const response = await gemini.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          marksObtained: { type: "number" },
          feedback: { type: "string" },
        },
        required: ["marksObtained", "feedback"],
      },
    },
  });

  if (!response.text) {
    throw new Error("AI evaluation failed");
  }

  const result = JSON.parse(response.text);

  return {
    marksObtained: Math.min(
      Math.max(Number(result.marksObtained), 0),
      maxMarks,
    ),
    feedback: result.feedback,
  };
};
