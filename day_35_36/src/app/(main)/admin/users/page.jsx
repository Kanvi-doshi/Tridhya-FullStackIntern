"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UserManagement() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "Employee",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async () => {
    try {
      if (!newUser.name || !newUser.email || !newUser.password) {
        alert("Please fill all fields");
        return;
      }
      const emailExists = users.find(
        (user) =>
          user.email.toLowerCase() === newUser.email.trim().toLowerCase(),
      );

      if (emailExists) {
        alert("Email already exists!");
        return;
      }

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();
      if (response.ok) {
        await loadUsers();

        alert(data.message);
        setShowAddModal(false);

        setNewUser({
          name: "",
          email: "",
          password: "",
          role: "Employee",
        });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const loadUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: id,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        await loadUsers();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "All" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <button
        onClick={() => router.push("/admin")}
        className="bg-gray-600 text-white px-5 py-2 rounded-lg mb-8"
      >
        ← Back
      </button>

      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold mb-8">User Management</h1>

        <div className="flex justify-between items-center mb-8">
          <input
            type="text"
            placeholder="Search User..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-3 rounded-lg w-80"
          />

          <div className="flex gap-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border p-3 rounded-lg"
            >
              <option>All</option>
              <option>Employee</option>
              <option>Manager</option>
              <option>Admin</option>
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-5 py-3 rounded-lg"
            >
              + Add User
            </button>
            <button
              onClick={() => {
                setSearch("");
                setRoleFilter("All");
              }}
              className="bg-gray-500 text-white px-5 rounded-lg"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Table */}

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Name</th>
              <th className="text-left">Email</th>
              <th className="text-left">Role</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-500">
                  No Users Found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id} className="border-b">
                  <td className="py-4">{user.name}</td>

                  <td>{user.email}</td>

                  <td>{user.role}</td>

                  <td>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                      >
                        View
                      </button>

                      <button
                        onClick={() =>
                          router.push(`/admin/users/edit/${user._id}`)
                        }
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteUser(user._id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}

      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white rounded-xl shadow-lg p-8 w-[450px]">
            <h2 className="text-2xl font-bold mb-6">User Details</h2>

            <div className="space-y-4">
              <p>
                <strong>Name:</strong> {selectedUser.name}
              </p>

              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>

              <p>
                <strong>Role:</strong> {selectedUser.role}
              </p>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setSelectedUser(null)}
                className="bg-red-600 text-white px-5 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add User Modal */}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-[500px]">
            <h2 className="text-2xl font-bold mb-6">Add New User</h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    name: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-lg"
              />

              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    email: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-lg"
              />

              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    password: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-lg"
              />

              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    role: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-lg"
              >
                <option>Employee</option>
                <option>Manager</option>
                <option>Admin</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => {
                  setShowAddModal(false);

                  setNewUser({
                    name: "",
                    email: "",
                    password: "",
                    role: "Employee",
                  });
                }}
                className="bg-gray-500 text-white px-5 py-2 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleAddUser}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
