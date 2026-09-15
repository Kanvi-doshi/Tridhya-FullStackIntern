export const getGemini = async () => {
  const { GoogleGenAI } = await import("@google/genai");

  const gemini = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  return gemini;
};
