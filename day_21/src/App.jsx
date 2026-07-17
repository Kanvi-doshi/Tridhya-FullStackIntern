import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useContext } from "react";
import Sidebar from "./components/Sidebar";
import { ThemeContext } from "./context/ThemeContext";

import Home from "./pages/Home";
import Movies from "./pages/Movie";
import Favorites from "./pages/Favorite";
import MovieDetails from "./pages/movieDetails";

import "./App.css";

function App() {
  const [favorites, setFavorites] = useState([]);
  const { darkMode } = useContext(ThemeContext);

  return (
    <BrowserRouter>
      <div className={`app ${darkMode ? "dark" : "light"}`}>
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/movies"
              element={
                <Movies favorites={favorites} setFavorites={setFavorites} />
              }
            />
            <Route
              path="/favorites"
              element={
                <Favorites favorites={favorites} setFavorites={setFavorites} />
              }
            />
            <Route path="/movie/:id" element={<MovieDetails />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
