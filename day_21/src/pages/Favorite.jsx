import { FaHeart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";

function Favorites({ favorites, setFavorites }) {
  function toggleFavorite(movie) {
    const exists = favorites.find((fav) => fav.id === movie.id);

    if (exists) {
      setFavorites(favorites.filter((fav) => fav.id !== movie.id));
    }
  }

  return (
    <div>
      <div className="fav">
        <FaHeart size={32} color="red"/>
        <h1>Favorites ({favorites.length})</h1>
      </div>

      {favorites.length === 0 ? (
        <p>No favorite movies added yet.</p>
      ) : (
        <div className="movies-grid">
          {favorites.map((movie) => (
            <div className="movie-card" key={movie.id}>
              <div className={`genre-tag ${movie.genre.toLowerCase()}`}>
                {movie.genre}
              </div>

              <img src={movie.image} alt={movie.title} />

              <h3>{movie.title}</h3>

              <p>Released: {movie.year}</p>

              <button onClick={() => toggleFavorite(movie)}>
                {" "}
                <FaHeart /> Added
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;
