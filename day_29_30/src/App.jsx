import { Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Workout from "./pages/Workout";
import Nutrition from "./pages/Nutrition";
import BMI from "./pages/BMI";
import History from "./pages/History";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/workout" element={<Workout />} />
      <Route path="/nutrition" element={<Nutrition />} />
      <Route path="/bmi" element={<BMI />} />
      <Route path="/history" element={<History />} />
    </Routes>
  );
}

export default App;
