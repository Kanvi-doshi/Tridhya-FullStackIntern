import { useState } from "react";
import movies from "../data/movies";
import { FaHeart, FaRegHeart, FaFilter } from "react-icons/fa";

function Movies({ favorites, setFavorites }) {
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("All");

  function toggleFavorite(movie) {
    const exists = favorites.find((fav) => fav.id === movie.id);
    if (exists) {
      setFavorites(favorites.filter((fav) => fav.id !== movie.id));
    } else {
      setFavorites([...favorites, movie]);
    }
  }

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesGenre = genreFilter === "All" || movie.genre === genreFilter;
    return matchesSearch && matchesGenre;
  });

  return (
    <div>
      <h1> Movies ({filteredMovies.length})</h1>
      <div className="controls">
        <input
          type="text"
          placeholder="Search movie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-container">
          <FaFilter className="filter-icon" />
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
          >
            <option value="All">All Genres</option>
            <option value="Sci-Fi">Sci-Fi</option>
            <option value="Action">Action</option>
            <option value="Drama">Drama</option>
            <option value="Fantasy">Fantasy</option>
            <option value="Biography">Biography</option>
          </select>
        </div>
      </div>
      <div className="movie-grid">
        {filteredMovies.map((movie) => (
          <div className="movie-card" key={movie.id}>
            <div className={`genre-tag ${movie.genre.toLowerCase()}`}>
              {movie.genre}
            </div>
            <img src={movie.image} alt={movie.title} />
            <h3>{movie.title}</h3>
            <p>Released: {movie.year}</p>
            <button onClick={() => toggleFavorite(movie)}>
              {favorites.some((fav) => fav.id === movie.id) ? (
                <>
                  <FaHeart className="favorite-icon" /> Added
                </>
              ) : (
                <>
                  <FaRegHeart className="favorite-icon" /> Add to Favorites
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Movies;
