import { useState, useEffect } from "react";
import UserCard from "./components/userCard";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => {
        setError("failed to catch the error");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("search", search);
  }, [search]);

  useEffect(() => {
    const savedSearch = localStorage.getItem("search");
    if (savedSearch) {
      setSearch(savedSearch);
    }
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().startsWith(search.toLowerCase()),
  );

  const sortedUsers = [...filteredUsers].sort((a, b) =>
    sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
  );

  return (
    <div className="container">
      <h1>User List</h1>

      <div className="controls">
        <input
          type="text"
          placeholder="Search User..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={() => setSortAsc(!sortAsc)}>
          {sortAsc ? "A-Z" : "Z-A"}
        </button>
      </div>

      <h3>Users Found: {sortedUsers.length}</h3>

      <div className="user-list">
        {sortedUsers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}

export default App;
