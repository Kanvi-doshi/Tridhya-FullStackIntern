import Sidebar from "../components/Sidebar";
import { getWorkoutHistory } from "../utils/WorkHistory";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function History() {
  const history = getWorkoutHistory();

  // Last 4 weeks for graph
  const graphData = [
    {
      week: "Week 1",
      progress: 90,
    },
    {
      week: "Week 2",
      progress: 60,
    },
    {
      week: "Week 3",
      progress: 75,
    },
    {
      week: "Week 4",
      progress: 82,
    },
  ];

  for (let i = 0; i < history.length; i += 7) {
    const weekEntries = history.slice(i, i + 7);

    const average =
      weekEntries.reduce((sum, item) => sum + item.progress, 0) /
      weekEntries.length;

    graphData.push({
      week: `Week ${graphData.length + 1}`,
      progress: Math.round(average),
    });
  }

  const averageProgress =
    history.length === 0
      ? 0
      : Math.round(
          history.reduce((sum, item) => sum + item.progress, 0) /
            history.length,
        );

  const bestWorkout =
    history.length > 0
      ? history.reduce((best, current) =>
          current.progress > best.progress ? current : best,
        )
      : null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="ml-64 flex-1 p-8">
        <h1 className="text-4xl font-bold mb-8">Workout History</h1>

        {/* Graph Section */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-2"> Weekly Progress</h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="week" />

              <YAxis />

              <Tooltip />

              <Bar dataKey="progress" fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Table Section */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mt-8">
          <h2 className="text-2xl font-semibold mb-5">Daily Workout History</h2>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                {/* <th className="p-3">Week </th> */}
                <th className="p-3">Day</th>
                <th className="p-3">Date</th>
                <th className="p-3">Progress</th>
              </tr>
            </thead>

            <tbody>
              {history.map((item, index) => (
                <tr key={index} className="border-b">
                  {/* <td className="p-3">Week {item.week}</td> */}

                  <td className="p-3">{item.day}</td>
                  <td className="p-3">{item.date}</td>
                  <td className="p-3">{item.progress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold">Total Entries</h3>

            <p className="text-3xl font-bold mt-3">{history.length}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold">Average Progress</h3>

            <p className="text-3xl font-bold mt-3">{averageProgress}%</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold">Best Workout</h3>

            <p className="text-2xl font-bold mt-3">
              {bestWorkout ? `${bestWorkout.progress}` : "--"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default History;
