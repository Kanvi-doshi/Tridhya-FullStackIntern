import { Link } from "react-router-dom";
import movies from "../data/movies";

function Home() {
  const upcomingMovies = [
    {
      id: 101,
      title: "Avengers: Secret Wars",
      year: 2027,
      genre: "Action",
      image: "https://picsum.photos/300/450?random=101",
    },
    {
      id: 102,
      title: "Spider-Man 4",
      year: 2026,
      genre: "Action",
      image: "https://picsum.photos/300/450?random=102",
    },
    {
      id: 103,
      title: "The Batman Part II",
      year: 2027,
      genre: "Action",
      image: "https://picsum.photos/300/450?random=103",
    },
    {
      id: 104,
      title: "Dune: Messiah",
      year: 2027,
      genre: "Sci-Fi",
      image: "https://picsum.photos/300/450?random=104",
    },
    {
      id: 105,
      title: "Shrek 5",
      year: 2026,
      genre: "Animation",
      image: "https://picsum.photos/300/450?random=105",
    },
    {
      id: 106,
      title: "Toy Story 5",
      year: 2026,
      genre: "Animation",
      image: "https://picsum.photos/300/450?random=106",
    },
    {
      id: 107,
      title: "Frozen 3",
      year: 2027,
      genre: "Animation",
      image: "https://picsum.photos/300/450?random=107",
    },
    {
      id: 108,
      title: "The Lord of the Rings: Hunt for Gollum",
      year: 2027,
      genre: "Fantasy",
      image: "https://picsum.photos/300/450?random=108",
    },
    {
      id: 109,
      title: "Avatar 4",
      year: 2029,
      genre: "Fantasy",
      image: "https://picsum.photos/300/450?random=109",
    },
    {
      id: 110,
      title: "Superman",
      year: 2026,
      genre: "Action",
      image: "https://picsum.photos/300/450?random=110",
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
      <div className="upcoming-container">
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
