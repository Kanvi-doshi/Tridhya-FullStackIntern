import { FiCalendar } from "react-icons/fi";
function NutritionCard({ day, meals }) {
  return (
    <div className=" space-y-4 bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300">
      {/* Day */}
      <h2 className=" flex items-center gap-2 text-2xl font-bold text-green-600 mb-5">
        {" "}
        <FiCalendar /> {day}
      </h2>

      {/* Breakfast */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-700">
          Breakfast
        </h3>

        <p className="text-gray-500 mt-1">
          {meals.breakfast}
        </p>
      </div>

      {/* Lunch */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-700">Lunch</h3>

        <p className="text-gray-500 mt-1">{meals.lunch}</p>
      </div>

      {/* Dinner */}
      <div>
        <h3 className="font-semibold text-gray-700">Dinner</h3>

        <p className="text-gray-500 mt-1">{meals.dinner}</p>
      </div>
    </div>
  );
}

export default NutritionCard;
