import movies from "../data/movies";
import { useParams, useNavigate } from "react-router-dom";

function MovieDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const movie = movies.find((movie) => movie.id === Number(id));

  if (!movie) {
    return <h2>Movie Not Found</h2>;
  }

  return (
    <div className="movie-details">
      <button onClick={() => navigate(-1)}>← Back</button>

      <img src={movie.image} alt={movie.title} />

      <h1>{movie.title}</h1>

      <p>Genre: {movie.genre}</p>
      <p>Year: {movie.year}</p>
      <p>Rating: {movie.rating}</p>
      <p>Duration: {movie.duration}</p>
    </div>
  );
}

export default MovieDetails;
