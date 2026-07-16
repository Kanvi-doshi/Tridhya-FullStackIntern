import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./components/Sidebar";

import Home from "./pages/Home";
import Movies from "./pages/Movie";
import Favorites from "./pages/Favorite";
import "./App.css";

function App() {
  const [favorites, setFavorites] = useState([]);

  return (
    <BrowserRouter>
      <div className="app">
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
              element={<Favorites favorites={favorites} setFavorites={setFavorites} />}
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
