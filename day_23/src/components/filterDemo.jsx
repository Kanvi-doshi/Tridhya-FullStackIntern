import { useFilter } from "../hooks/useFilter";

function FilterDemo() {
  const movies = [
    { title: "Interstellar", genre: "Sci-Fi" },
    { title: "Batman", genre: "Action" },
    { title: "Avatar", genre: "Sci-Fi" },
    { title: "Joker", genre: "Drama" },
  ];

  const { filter, setFilter, filteredData } = useFilter(movies, "genre");

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4">useFilter Hook</h2>
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full p-3 border rounded-lg mb-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="All">All</option>
        <option value="Sci-Fi">Sci-Fi</option>
        <option value="Action">Action</option>
        <option value="Drama">Drama</option>
      </select>

      {filteredData.map((movie, index) => (
        <div
          key={index}
          className="flex justify-between items-center p-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
        >
          <span className="font-medium">{movie.title}</span>

          <span className="px-3 py-1 text-sm bg-blue-500 text-white rounded-full">
            {movie.genre}
          </span>
        </div>
      ))}
    </div>
  );
}

export default FilterDemo;
