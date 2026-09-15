export const calculateOverallScore = (
  assessmentScore:Number,
  interviewRating:Number,
) => {
  const interviewScore = (Number(interviewRating) / 5) * 100;
  const overallScore = Number(assessmentScore) * 0.6 + interviewScore * 0.4;
  return Number(overallScore.toFixed(2));
};
