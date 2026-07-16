import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Movie App</h2>

      <Link to="/"> Home</Link>

      <Link to="/movies"> Movies</Link>

      <Link to="/favorites">Favorites</Link>
    </div>
  );
}

export default Sidebar;
