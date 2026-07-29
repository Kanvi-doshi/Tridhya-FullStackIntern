import Sidebar from "../components/Sidebar";
import NutritionCard from "../components/NutritionCard";
import { nutritionPlans } from "../data/nutrition";
import { GiMeal } from "react-icons/gi";

function Nutrition() {
  const user = JSON.parse(localStorage.getItem("user"));

  const plans = nutritionPlans[user?.goal]?.[user?.diet] || [];

  return (
    <>
      <Sidebar />

      <div className="ml-64 min-h-screen bg-gray-100 p-8">
        {/* Heading */}
        <h1 className="flex items-center gap-2 text-4xl font-bold text-gray-800">
          <GiMeal />
          Weekly Nutrition Plan
        </h1>

        <p className="text-gray-500 mt-2">
          Goal:
          <span className="font-semibold text-blue-600 ml-2">{user?.goal}</span>
        </p>

        <p className="text-gray-500 mb-8">
          Diet Preference:
          <span className="font-semibold text-green-600 ml-2">
            {user?.diet}
          </span>
        </p>

        {/* Nutrition Cards */}
        {plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan, index) => (
              <NutritionCard key={index} day={plan.day} meals={plan.meals} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <h2 className="text-2xl font-bold text-red-500">
              No Nutrition Plan Found
            </h2>

            <p className="text-gray-500 mt-2">
              Please complete your profile and select a fitness goal and diet
              preference.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default Nutrition;
