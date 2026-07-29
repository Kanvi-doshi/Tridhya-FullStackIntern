import { useEffect, useState } from "react";
import { saveWorkoutHistory } from "../utils/WorkHistory";

function WorkoutCard({ day, exercises, locked }) {
  const [completed, setCompleted] = useState(
    JSON.parse(localStorage.getItem(day)) || {},
  );

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const completedCount = Object.values(completed).filter(Boolean).length;

  const workoutProgress =
    JSON.parse(localStorage.getItem("workoutProgress")) || {};

  const isDayCompleted = workoutProgress[day];

  const handleToggle = (exerciseName) => {
    const updated = { ...completed, [exerciseName]: !completed[exerciseName] };
    setCompleted(updated);
  };

  const handleCompleteDay = () => {
    const progress = Math.round((completedCount / exercises.length) * 100);
    saveWorkoutHistory(progress, day);

    const updatedProgress = {
      ...workoutProgress,
      [day]: true,
    };

    localStorage.setItem("workoutProgress", JSON.stringify(updatedProgress));
    window.dispatchEvent(new Event("workoutUpdated"));

    if (day === "Sunday") {
      days.forEach((dayName) => {
        localStorage.removeItem(dayName);
      });
      localStorage.removeItem("workoutProgress");
      alert("Congratulations! Weekly workout completed!");
    } else {
      alert(`${day} completed! Next day unlocked.`);
    }

    window.location.reload();
  };

  useEffect(() => {
    localStorage.setItem(day, JSON.stringify(completed));
  }, [completed, day]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-blue-600 mb-2">{day}</h2>

      <p className="text-gray-500 mb-5">
        Progress: {completedCount}/{exercises.length}
      </p>

      <div className="space-y-4">
        {exercises.map((exercise, index) => (
          <div key={index} className="flex gap-3 items-start">
            <input
              type="checkbox"
              checked={completed[exercise.name] || false}
              onChange={() => handleToggle(exercise.name)}
              disabled={
                locked || isDayCompleted || exercise.name === "Rest Day"
              }
              className="mt-1"
            />

            <div>
              <p
                className={`font-medium ${
                  completed[exercise.name]
                    ? "line-through text-gray-400"
                    : "text-gray-800"
                }`}
              >
                {exercise.name}
              </p>

              <p className="text-sm text-gray-500">{exercise.details}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleCompleteDay}
        disabled={locked || isDayCompleted}
        className="mt-6 w-full bg-blue-600 text-white py-2 rounded-xl disabled:bg-gray-400"
      >
        {isDayCompleted ? "Day Completed" : "Complete Day"}
      </button>
    </div>
  );
}

export default WorkoutCard;
