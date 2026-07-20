import { useLocalStorage } from "../hooks/useLocalStorage";

function LocalStorageDemo() {
  const [name, setName] = useLocalStorage("username", "");

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4">useLocalStorage Hook</h2>

      <p className="text-gray-500 mb-4">Persist data in local storage.</p>
      <input
        type="text"
        placeholder="Enter Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              Saved Value: <strong>Kanvi { name}</strong>
      </div>
    </div>
  );
}

export default LocalStorageDemo;
