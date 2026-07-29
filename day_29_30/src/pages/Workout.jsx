import Sidebar from "../components/Sidebar";
import WorkoutCard from "../components/WorkoutCard";
import { workoutPlans } from "../Data/WorkoutPlans";

function Workout() {
  const user = JSON.parse(localStorage.getItem("user"));

  const workouts = workoutPlans[user?.goal] || [];

  return (
    <>
      <Sidebar />

      <div className="ml-64 min-h-screen bg-gray-100 p-8">

        <h1 className="text-4xl font-bold text-gray-800">
          Weekly Workout Plan
        </h1>

        <p className="text-gray-500 mt-2 mb-8">
          Goal:{" "}
          <span className="font-semibold text-blue-600">{user?.goal}</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workouts.map((workout, index) => (
            <WorkoutCard
              key={index}
              day={workout.day}
              exercises={workout.exercises}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default Workout;
