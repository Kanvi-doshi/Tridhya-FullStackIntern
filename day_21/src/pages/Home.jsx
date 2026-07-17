import movies from "../data/movies";
import Av4 from "../assets/Av4.jpg"
import batman2 from "../assets/batman2.jpg"
import F3 from "../assets/F3.jpg"
import secretWars from "../assets/secretWars.webp"
import spider4 from "../assets/spider4.jpg"
import TS5 from "../assets/TS5.jpg"
import TheLordsofrings from "../assets/TheLordsofrings.jpg"
function Home() {
  const upcomingMovies = [
    {
      id: 31,
      title: "Avengers: Secret Wars",
      year: 2027,
      genre: "Action",
      image: secretWars,
    },
    {
      id: 32,
      title: "Spider-Man 4",
      year: 2026,
      genre: "Action",
      image: spider4,
    },
    {
      id: 33,
      title: "The Batman Part II",
      year: 2027,
      genre: "Action",
      image: batman2,
    },
    {
      id: 34,
      title: "Toy Story 5",
      year: 2026,
      genre: "Animation",
      image: TS5,
    },
    {
      id: 35,
      title: "Frozen 3",
      year: 2027,
      genre: "Animation",
      image: F3,
    },
    {
      id: 36,
      title: "The Lord of the Rings: Hunt for Gollum",
      year: 2027,
      genre: "Fantasy",
      image: TheLordsofrings,
    },
    {
      id: 37,
      title: "Avatar 4",
      year: 2029,
      genre: "Fantasy",
      image:Av4,
    },
  ];

  return (
    <div className="home">
      <section className="hero">
        <h1> Discover Amazing Movies</h1>
        <p>Browse trending movies and upcoming blockbusters.</p>
      </section>

      <h2>Popular Movies</h2>
      <div className="movies-grid">
        {movies.slice(0, 4).map((movie) => (
          <div className="movie-card" key={movie.id}>
            <div className={`genre-tag ${movie.genre.toLowerCase()}`}>
              {movie.genre}
            </div>
            <img src={movie.image} alt={movie.title} />
            <h3>{movie.title}</h3>
            <p>Released:{movie.year}</p>
          </div>
        ))}
      </div>

      <h2> Upcoming Movies</h2>
      <div className="movies-grid">
        {upcomingMovies.map((movie) => (
          <div className="movie-card" key={movie.id}>
            <div className={`genre-tag ${movie.genre.toLowerCase()}`}>
              {movie.genre}
            </div>
            <img src={movie.image} alt={movie.title} />
            <h3>{movie.title}</h3>
            <p>Releasing:{movie.year}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
