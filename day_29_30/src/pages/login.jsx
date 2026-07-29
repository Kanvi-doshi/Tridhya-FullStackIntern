import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    email: "",
    goal: "",
    diet: "",
  });

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!user.name || !user.email || !user.goal || !user.diet) {
      alert("Please fill all the fields!");
      return;
    }

    localStorage.setItem("user", JSON.stringify(user));

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white w-[420px] p-8 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-2">
          Smart Gym
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Start your fitness journey today!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={user.name}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={user.email}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            name="goal"
            value={user.goal}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Fitness Goal</option>
            <option value="Weight Loss">Weight Loss</option>
            <option value="Weight Gain">Weight Gain</option>
            <option value="Muscle Gain">Muscle Gain</option>
          </select>

          <select
            name="diet"
            value={user.diet}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Diet Preference</option>

            <option value="Vegetarian">Vegetarian</option>

            <option value="Non-Vegetarian">Non-Vegetarian</option>
          </select>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg font-semibold"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
