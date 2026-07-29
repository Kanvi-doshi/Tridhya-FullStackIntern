import Sidebar from "../components/Sidebar";
import DashboardCard from "../components/DashboardCard";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { getWorkoutHistory } from "../utils/WorkHistory";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const latestBMI = localStorage.getItem("latestBMI") || "--";

  let bmiStatus = "--";

  if (latestBMI < 18.5) {
    bmiStatus = "Underweight";
  } else if (latestBMI < 25) {
    bmiStatus = "Normal";
  } else if (latestBMI < 30) {
    bmiStatus = "Overweight";
  } else if (latestBMI !== "--") {
    bmiStatus = "Obese";
  }

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  
  // daily progress
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });

  const todayExercises = JSON.parse(localStorage.getItem(today)) || {};
  const totalExercises = Object.keys(todayExercises).length;

  const completedExercises =
    Object.values(todayExercises).filter(Boolean).length;

  const progress =
    totalExercises === 0
      ? 0
      : Math.round((completedExercises / totalExercises) * 100);

  const intake = {
    "Weight Loss": {
      calories: "1800 kcal",
      protein: "80 g",
      water: "3 L",
      sleep: "8 Hours",
    },

    "Weight Gain": {
      calories: "2800 kcal",
      protein: "100 g",
      water: "3.5 L",
      sleep: "8 Hours",
    },

    "Muscle Gain": {
      calories: "2400 kcal",
      protein: "130 g",
      water: "4 L",
      sleep: "8 Hours",
    },
  };

  const userIntake = intake[user?.goal] || {
    calories: "--",
    protein: "--",
    water: "--",
    sleep: "--",
  };
  
  const history = getWorkoutHistory();
  const data = history.map((item) => ({
    name: item.day,
    value: item.progress,
  }));
  const completedDays = data.filter((item) => item.value > 0).length;
  
  const COLORS = [
    "#1E3A8A",
    "#2563EB",
    "#60A5FA",
    "#93C5FD",
    "#BFDBFE",
    "#C7D2FE",
    "#E0E7FF",
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="ml-64 flex-1 p-8">
        <h1 className="text-4xl font-bold">Welcome, {user?.name}!</h1>

        <p className="text-gray-500 mt-2">
          Let's achieve your fitness goals today.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <DashboardCard title="BMI" value={latestBMI} subtitle={bmiStatus} />

          <DashboardCard
            title="Workout Progress"
            value={`${progress}%`}
            subtitle="Completed"
          />

          <DashboardCard
            title="Water Intake"
            value={userIntake.water}
            subtitle="Daily Goal"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <DashboardCard title="Fitness Goal" value={user?.goal} />

          <DashboardCard title="Diet Preference" value={user?.diet} />
        </div>

        <h2 className="text-2xl font-bold mt-10 mb-6">
          Recommended Daily Intake
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard title="Calories" value={userIntake.calories} />
          <DashboardCard title="Protein" value={userIntake.protein} />
          <DashboardCard title="Sleep" value={userIntake.sleep} />
          <DashboardCard title="Water" value={userIntake.water} />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg mt-10">
          <h2 className="text-2xl font-semibold mb-6">
            Weekly Workout Progress
          </h2>

          <div className="flex items-center justify-center gap-10">
            <PieChart width={400} height={300}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                nameKey="name"
                label
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>

            <div className="space-y-3">
              {days.map((day, index) => (
                <div key={day} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  ></div>

                  <span>{day}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center mt-4 text-lg font-medium">
            {completedDays}/7 Days Completed
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-2xl shadow-lg mt-10">
          <h2 className="text-3xl font-bold">Stay Consistent!</h2>

          <p className="mt-3 text-lg">
            Small progress every day leads to big results.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
