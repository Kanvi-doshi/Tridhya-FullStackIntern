import { getGemini } from "../config/gemini";

export interface CandidateAIResult {
  summary: string;
  strengths: string[];
  concerns: string[];
  recommendation:
    | "STRONGLY_RECOMMEND"
    | "RECOMMEND"
    | "NEUTRAL"
    | "NOT_RECOMMEND";
}

interface CandidateAIInput {
  candidateName: string;

  jobTitle: string;
  jobDescription: string;

  resumeSummary: string | null;
  resumeSkills: string[] | null;
  resumeExperience: string | null;
  resumeEducation: string | null;
  resumeStrengths: string[] | null;
  resumeMissingSkills: string[] | null;
  jobMatchScore: number | null;

  assessmentScore: number;
  interviewRating: number;

  interviewStrengths: string[];
  interviewWeaknesses: string[];
  interviewComments: string[];

  overallScore: number | null;
}

export const generateCandidateAISummary = async (
  data: CandidateAIInput,
): Promise<CandidateAIResult> => {
  const gemini = await getGemini();

  const prompt = `
You are helping an HR team evaluate a candidate.
Use ONLY the information provided below.
Do not invent candidate details.

CANDIDATE:${data.candidateName}
JOB:${data.jobTitle}
JOB DESCRIPTION:${data.jobDescription}

RESUME ANALYSIS:
Summary:${data.resumeSummary ?? "Not available"}
Skills: ${data.resumeSkills?.join(", ") || "Not available"}
Experience:${data.resumeExperience ?? "Not available"}
Education:${data.resumeEducation ?? "Not available"}
Resume Strengths:${data.resumeStrengths?.join(", ") || "Not available"}
Missing Skills:${data.resumeMissingSkills?.join(", ") || "None identified"}
Resume Job Match Score:${data.jobMatchScore ?? "Not available"}

ASSESSMENT PERFORMANCE:
Assessment Average Score:${data.assessmentScore} / 100

INTERVIEW PERFORMANCE:
Average Interview Rating:${data.interviewRating} / 5
Interview Strengths:${data.interviewStrengths.join(", ") || "Not available"}
Interview Weaknesses:${data.interviewWeaknesses.join(", ") || "Not available"}
Interviewer Comments:${data.interviewComments.join(" | ") || "Not available"}

FINAL SYSTEM SCORE:
Overall Score:${data.overallScore ?? "Not calculated"}

Create a final candidate evaluation for HR.

The summary should briefly explain:
- resume suitability
- assessment performance
- interview performance
- overall suitability for the job

Return:
- summary
- important strengths
- concerns or weaknesses
- final recommendation

The recommendation MUST be exactly one of:

STRONGLY_RECOMMEND
RECOMMEND
NEUTRAL
NOT_RECOMMEND

Do not make the recommendation based only on one factor.
Consider resume match, assessments, interviews and overall score together.
`;

  const response = await gemini.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          summary: {
            type: "string",
          },
          strengths: {
            type: "array",
            items: {
              type: "string",
            },
          },
          concerns: {
            type: "array",
            items: {
              type: "string",
            },
          },
          recommendation: {
            type: "string",
            enum: [
              "STRONGLY_RECOMMEND",
              "RECOMMEND",
              "NEUTRAL",
              "NOT_RECOMMEND",
            ],
          },
        },
        required: ["summary", "strengths", "concerns", "recommendation"],
      },
    },
  });

  if (!response.text) {
    throw new Error("Gemini did not return candidate evaluation");
  }

  const result: CandidateAIResult = JSON.parse(response.text);
  return result;
};
