import { useState, useEffect } from "react";
import { useDebounce } from "../hooks/useDebounce";

function SearchFilterDemo() {
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 500);

  const movies = [
    "Interstellar",
    "Inception",
    "Joker",
    "Avatar",
    "Titanic",
    "Batman",
    "Frozen",
  ];
  useEffect(() => {
    console.log("Typing:", search);
  }, [search]);

  useEffect(() => {
    console.log("Debounced:", debouncedSearch);
  }, [debouncedSearch]);

  const filteredMovies = movies.filter((movie) =>
    movie.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Search + Debounce Demo</h2>

      <input
        type="text"
        placeholder="Search movie..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-lg px-4 py-3 mb-6 outline-none focus:ring-2 focus:ring-blue-500"
      />

      <h3>Results</h3>

      <div className="space-y-3">
        {filteredMovies.map((movie, index) => (
          <div
            key={index}
            className="p-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
          >
            {movie}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchFilterDemo;
