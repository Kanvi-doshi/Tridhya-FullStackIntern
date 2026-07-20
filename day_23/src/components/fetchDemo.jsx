import { useFetch } from "../hooks/useFetch";

function FetchDemo() {
  const { data, loading, error, fetchData } = useFetch(
    "https://jsonplaceholder.typicode.com/users",
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-2">useFetch Hook</h2>
      <p className="text-gray-500 mb-4">Fetch data from an API.</p>

      <button
        onClick={fetchData}
        className="px-5 py-2 bg-blue-500 text-white rounded-lg mb-4 hover:bg-blue-600"
      >
        Fetch Users
      </button>
      {loading && <h3>Loading...</h3>}

      {error && <h3>{error}</h3>}
      {data.map((user) => (
        <p key={user.id}>{user.name}</p>
      ))}
    </div>
  );
}

export default FetchDemo;
