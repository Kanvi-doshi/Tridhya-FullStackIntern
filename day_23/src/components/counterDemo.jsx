import { useCounter } from "../hooks/useCounter";
function CounterDemo() {
  const { count, inc, dec, reset } = useCounter();

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4">useCounter Hook</h2>
      <div className="text-5xl font-bold text-center mb-6">{count}</div>
      <div className="flex justify-center gap-3">
        <button
          onClick={dec}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:scale-105 transition"
        >
          -
        </button>

        <button
          onClick={reset}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg"
        >
          Reset
        </button>
        <button
          onClick={inc}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:scale-105 transition"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default CounterDemo;
