export function useFavorites(favorites, setFavorites) {
  function toggleFavorite(movie) {
    const exists = favorites.some((fav) => fav.id === movie.id);

    if (exists) {
      setFavorites(favorites.filter((fav) => fav.id !== movie.id));
    } else {
      setFavorites([...favorites, movie]);
    }
  }

  function isFavorite(id) {
    return favorites.some((fav) => fav.id === id);
  }

  return {
    toggleFavorite,
    isFavorite,
  };
}   
