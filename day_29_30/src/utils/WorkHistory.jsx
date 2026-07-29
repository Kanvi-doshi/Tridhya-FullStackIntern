export const saveWorkoutHistory = (progress, day) => {
  const history = JSON.parse(localStorage.getItem("workoutHistory")) || [];

  const lastEntry = history[history.length - 1];

  const existingIndex = history.findIndex((item) => item.day === day);

  if (existingIndex !== -1) {
    // Update existing day's progress
    history[existingIndex].progress = progress;
    history[existingIndex].date = new Date().toLocaleDateString();
  } else {
    // Add a new day
    history.push({
      week: 1,
      day,
      date: new Date().toLocaleDateString(),
      progress,
    });
  }

  localStorage.setItem("workoutHistory", JSON.stringify(history));
};

export const getWorkoutHistory = () => {
  return JSON.parse(localStorage.getItem("workoutHistory")) || [];
};

export const clearWorkoutHistory = () => {
  localStorage.removeItem("workoutHistory");
};
