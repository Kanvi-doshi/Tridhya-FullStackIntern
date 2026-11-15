import { useEffect, useState } from "react";
import { Search, Eye, Trash2, Loader2, X } from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import api from "../../service/api";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/users");

      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Fetch users error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleViewUser = async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);

      setSelectedUser(response.data.user);
      setShowViewModal(true);
    } catch (error) {
      console.error("Get user error:", error);

      alert(error.response?.data?.message || "Failed to load user");
    }
  };

  const handleRoleChange = async (userId, roleId) => {
    try {
      await api.put(`/admin/users/${userId}/role`, {
        role_id: Number(roleId),
      });

      await fetchUsers();
    } catch (error) {
      console.error("Update role error:", error);

      alert(error.response?.data?.message || "Failed to update role");
    }
  };

  const handleDelete = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/admin/users/${userId}`);

      await fetchUsers();
    } catch (error) {
      console.error("Delete user error:", error);

      alert(error.response?.data?.message || "Failed to delete user");
    }
  };

  const filteredUsers = users.filter((user) => {
    const value = search.toLowerCase();

    return (
      user.first_name?.toLowerCase().includes(value) ||
      user.last_name?.toLowerCase().includes(value) ||
      user.email?.toLowerCase().includes(value) ||
      user.role_name?.toLowerCase().includes(value)
    );
  });

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>

            <p className="mt-1 text-gray-500">Manage system users and roles</p>
          </div>

          <div className="mb-6 max-w-md">
            <div className="relative">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={40} className="animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
              <table className="min-w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      User
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      Email
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      Phone
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      Role
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredUsers.map((user) => (
                    <tr key={user.user_id}>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </p>
                      </td>

                      <td className="px-5 py-4">{user.email}</td>

                      <td className="px-5 py-4">{user.phone || "-"}</td>

                      <td className="px-5 py-4">
                        <select
                          value={user.role_id}
                          onChange={(e) =>
                            handleRoleChange(user.user_id, e.target.value)
                          }
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        >
                          <option value="1">Customer</option>

                          <option value="2">Staff</option>

                          <option value="3">Admin</option>
                        </select>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewUser(user.user_id)}
                            className="rounded-lg bg-gray-100 p-2 text-gray-700 hover:bg-gray-200"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            onClick={() => handleDelete(user.user_id)}
                            className="rounded-lg bg-red-100 p-2 text-red-700 hover:bg-red-200"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* VIEW USER MODAL */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  User Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  User #{selectedUser.user_id}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedUser(null);
                }}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Name</p>

                <p className="mt-1 font-semibold">
                  {selectedUser.first_name} {selectedUser.last_name}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Email</p>

                <p className="mt-1 font-semibold">{selectedUser.email}</p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Phone</p>

                <p className="mt-1 font-semibold">
                  {selectedUser.phone || "Not provided"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Role</p>

                <p className="mt-1 font-semibold">{selectedUser.role_name}</p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Created At</p>

                <p className="mt-1 font-semibold">
                  {new Date(selectedUser.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedUser(null);
                }}
                className="rounded-lg bg-gray-800 px-5 py-2.5 text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminUsers;
