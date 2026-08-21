import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  getAdminUsers,
  addAdminUser,
  updateUserRole,
  deleteAdminUser,
  getAdminOrders,
  updateOrderStatus,
} from "../service/admin.service";

import { getUser, clearAuth } from "../components/utils/auth";

import {
  FaUsers,
  FaShoppingCart,
  FaBox,
  FaMoneyBillWave,
  FaUserPlus,
  FaTrash,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";

function Admin() {
  const navigate = useNavigate();

  const currentUser = getUser();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      const [usersResponse, ordersResponse] = await Promise.all([
        getAdminUsers(),
        getAdminOrders(),
      ]);

      setUsers(usersResponse.users || []);
      setOrders(ordersResponse.orders || []);
    } catch (error) {
      console.error("ADMIN DATA ERROR:", error);
      toast.error(error.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/home");
      return;
    }

    fetchAdminData();
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    try {
      const response = await addAdminUser(newUser);

      setUsers((prev) => [response.user, ...prev]);

      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "user",
      });

      setShowAddUser(false);

      toast.success("User added successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      const response = await updateUserRole(userId, role);

      setUsers((prev) =>
        prev.map((user) => (user._id === userId ? response.user : user)),
      );

      toast.success("User role updated");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?",
    );

    if (!confirmDelete) return;

    try {
      await deleteAdminUser(userId);

      setUsers((prev) => prev.filter((user) => user._id !== userId));
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleOrderStatus = async (orderId, status) => {
    try {
      const response = await updateOrderStatus(orderId, status);

      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? response.order : order)),
      );

      toast.success("Order status updated");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const totalUsers = users.length;

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "pending",
  ).length;

  const totalRevenue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce(
      (total, order) => total + Number(order.totalAmount || order.total || 0),
      0,
    );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold text-gray-600">
          Loading Admin Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}

      <header className="bg-white shadow-sm px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>

          <p className="text-sm text-gray-500">
            Manage your Redux Cart application
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold"
          >
            <FaUser />
            Profile
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}

      <main className="max-w-7xl mx-auto p-6">
        {/* TABS */}

        <div className="bg-white rounded-xl shadow mb-6">
          <div className="flex overflow-x-auto border-b">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-6 py-4 font-semibold whitespace-nowrap ${
                activeTab === "dashboard"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-4 font-semibold whitespace-nowrap ${
                activeTab === "users"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Users
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`px-6 py-4 font-semibold whitespace-nowrap ${
                activeTab === "orders"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Orders
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`px-6 py-4 font-semibold whitespace-nowrap ${
                activeTab === "products"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Products
            </button>
          </div>
        </div>

        {/* DASHBOARD TAB */}

        {activeTab === "dashboard" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* USERS */}

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500">Total Users</p>

                    <h3 className="text-3xl font-bold mt-2">{totalUsers}</h3>
                  </div>

                  <div className="bg-blue-100 p-4 rounded-full">
                    <FaUsers className="text-blue-600 text-2xl" />
                  </div>
                </div>
              </div>

              {/* ORDERS */}

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500">Total Orders</p>

                    <h3 className="text-3xl font-bold mt-2">{totalOrders}</h3>
                  </div>

                  <div className="bg-purple-100 p-4 rounded-full">
                    <FaShoppingCart className="text-purple-600 text-2xl" />
                  </div>
                </div>
              </div>

              {/* PENDING */}

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500">Pending Orders</p>

                    <h3 className="text-3xl font-bold mt-2">{pendingOrders}</h3>
                  </div>

                  <div className="bg-yellow-100 p-4 rounded-full">
                    <FaBox className="text-yellow-600 text-2xl" />
                  </div>
                </div>
              </div>

              {/* REVENUE */}

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500">Revenue</p>

                    <h3 className="text-3xl font-bold mt-2">₹{totalRevenue}</h3>
                  </div>

                  <div className="bg-green-100 p-4 rounded-full">
                    <FaMoneyBillWave className="text-green-600 text-2xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* RECENT ORDERS */}

            <div className="bg-white rounded-xl shadow mt-8 p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold">Recent Orders</h2>

                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-blue-600 font-semibold"
                >
                  View All
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-gray-500">No orders found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="py-3">Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order._id} className="border-b">
                          <td className="py-4">
                            {order.user?.name || "Unknown"}
                          </td>

                          <td>₹{order.totalAmount || order.total || 0}</td>

                          <td>
                            <span className="capitalize">{order.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/*  USERS TAB */}

        {activeTab === "users" && (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Manage Users</h2>

                <p className="text-gray-500">Add, update or remove users</p>
              </div>

              <button
                onClick={() => setShowAddUser(!showAddUser)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold"
              >
                <FaUserPlus />
                Add User
              </button>
            </div>

            {/* ADD USER FORM */}

            {showAddUser && (
              <form
                onSubmit={handleAddUser}
                className="bg-gray-50 border rounded-xl p-6 mb-6"
              >
                <h3 className="text-lg font-bold mb-4">Add New User</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        name: e.target.value,
                      })
                    }
                    className="border p-3 rounded-lg"
                    required
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
                    className="border p-3 rounded-lg"
                    required
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
                    className="border p-3 rounded-lg"
                    required
                  />

                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        role: e.target.value,
                      })
                    }
                    className="border p-3 rounded-lg"
                  >
                    <option value="user">User</option>

                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold"
                  >
                    Create User
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddUser(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* USERS TABLE */}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-4">Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="py-4 font-semibold">{user.name}</td>

                      <td>{user.email}</td>

                      <td>
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user._id, e.target.value)
                          }
                          className="border rounded-lg px-3 py-2"
                        >
                          <option value="user">User</option>

                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={user._id === currentUser?._id}
                          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg"
                        >
                          <FaTrash />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && (
                <p className="text-center py-8 text-gray-500">
                  No users found.
                </p>
              )}
            </div>
          </div>
        )}

       {/*  orders Tab */}

        {activeTab === "orders" && (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Manage Orders</h2>

              <p className="text-gray-500">View and update customer orders</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-4">Customer</th>

                    <th>Email</th>

                    <th>Amount</th>

                    <th>Items</th>

                    <th>Status</th>

                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b hover:bg-gray-50">
                      <td className="py-4 font-semibold">
                        {order.user?.name || "Unknown"}
                      </td>

                      <td>{order.user?.email || "N/A"}</td>

                      <td>₹{order.totalAmount || order.total || 0}</td>

                      <td>{order.items?.length || 0}</td>

                      <td>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleOrderStatus(order._id, e.target.value)
                          }
                          className="border rounded-lg px-3 py-2"
                        >
                          <option value="pending">Pending</option>

                          <option value="confirmed">Confirmed</option>

                          <option value="shipped">Shipped</option>

                          <option value="delivered">Delivered</option>

                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td>
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {orders.length === 0 && (
                <p className="text-center py-8 text-gray-500">
                  No orders found.
                </p>
              )}
            </div>
          </div>
        )}

                {/* PRODUCTS TAB */}
      

        {activeTab === "products" && (
          <div className="bg-white rounded-xl shadow p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Product Management</h2>

                <p className="text-gray-500 mt-1">
                  Manage products from the admin panel.
                </p>
              </div>

              <button
                onClick={() => navigate("/products")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold"
              >
                Manage Products
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <h3 className="font-bold text-lg">Product Management</h3>

              <p className="text-gray-600 mt-2">
                Add, edit, delete and manage your products here.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Admin;
