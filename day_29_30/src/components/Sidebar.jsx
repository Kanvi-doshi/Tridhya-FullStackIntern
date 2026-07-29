import { NavLink, useNavigate } from "react-router-dom";
import { FiLogOut, FiUser, FiActivity } from "react-icons/fi";
import { GiFruitBowl } from "react-icons/gi";
import { MdDashboard } from "react-icons/md";
import { FaWeightScale } from "react-icons/fa6";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="w-64 min-h-screen fixed bg-gray-900 text-white p-6 flex flex-col">
      <h1 className="text-3xl font-bold mb-10">Smart Gym</h1>

      <div className="flex flex-col gap-5">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <MdDashboard />
          Dashboard
        </NavLink>

        <NavLink to="/workout" className="flex items-center gap-2">
          <FiActivity />
          Workout
        </NavLink>

        <NavLink to="/nutrition" className="flex items-center gap-2">
          <GiFruitBowl />
          Nutrition
        </NavLink>

        <NavLink to="/bmi" className="flex items-center gap-2">
          <FaWeightScale />
          BMI
        </NavLink>
        <NavLink to="/history">History</NavLink>
      </div>

      <div className="mt-auto border-t border-gray-700 pt-5">
        <NavLink to="/profile" className="flex items-center gap-2 mb-4">
          <FiUser />
          Profile
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-12 py-3 rounded-xl text-red-500 hover:text-red-400 "
        >
          <span className="font-medium ">Logout</span>
          <FiLogOut size={20} />
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
