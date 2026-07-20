import { useToggle } from "../hooks/useToggle";

function ToggleDemo() {
  const [isDark, toggle] = useToggle();

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-500">
        useToggle Hook
      </h2>

      <p className="text-xl font-medium mb-4">
        Status: {isDark ? "🟢 ON" : "🔴 OFF"}
      </p>

      <button
        onClick={toggle}
        className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:scale-105 transition"
      >
        Toggle Theme
      </button>
    </div>
  );
}

export default ToggleDemo;
