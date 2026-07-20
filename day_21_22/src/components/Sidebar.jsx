import { Link } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

function Sidebar() {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Movie App</h2>

        <label className="switch">
          <input type="checkbox" checked={darkMode} onChange={toggleTheme} />
          <span className="slider"></span>
        </label>
      </div>

      <Link to="/"> Home</Link>

      <Link to="/movies"> Movies</Link>

      <Link to="/favorites">Favorites</Link>
    </div>
  );
}

export default Sidebar;
