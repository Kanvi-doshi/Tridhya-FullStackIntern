import { getGemini } from "../config/gemini";

export interface ResumeAnalysisResult {
  summary: string;
  skills: string[];
  experience: string;
  education: string;
  strengths: string[];
  missingSkills: string[];
  jobMatchScore: number;
}

export const analyzeResumeWithAI = async (
  resumeText: string,
  jobTitle: string,
  jobDescription: string,
): Promise<ResumeAnalysisResult> => {
  const gemini = await getGemini();

  const prompt = `
You are analyzing a candidate resume for a job application.

JOB TITLE:
${jobTitle}

JOB DESCRIPTION:
${jobDescription}

CANDIDATE RESUME:
${resumeText}

Analyze the resume against the job.

Return:
- a short candidate summary
- technical and relevant skills found in the resume
- experience summary
- education summary
- strengths relevant to the job
- important skills or requirements missing from the resume
- job match score from 0 to 100

Do not invent information that is not present in the resume.
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

          skills: {
            type: "array",
            items: {
              type: "string",
            },
          },

          experience: {
            type: "string",
          },

          education: {
            type: "string",
          },

          strengths: {
            type: "array",
            items: {
              type: "string",
            },
          },

          missingSkills: {
            type: "array",
            items: {
              type: "string",
            },
          },

          jobMatchScore: {
            type: "number",
          },
        },

        required: [
          "summary",
          "skills",
          "experience",
          "education",
          "strengths",
          "missingSkills",
          "jobMatchScore",
        ],
      },
    },
  });

  if (!response.text) {
    throw new Error(
      "Gemini did not return resume analysis",
    );
  }

  const analysis: ResumeAnalysisResult =
    JSON.parse(response.text);

  return analysis;
};