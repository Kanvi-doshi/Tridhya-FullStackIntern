"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [dashboardCards, setDashboardCards] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));

        if (!currentUser) {
          router.push("/login");
          return;
        }

        const response = await fetch(`/api/admin?email=${currentUser.email}`);
        const data = await response.json();
        if (response.ok) {
          setUser(data.user);
          setDashboardCards([
            {
              title: "Total Users",
              value: data.totalUsers,
            },
            {
              title: "Employees",
              value: data.totalEmployees,
            },
            {
              title: "Managers",
              value: data.totalManagers,
            },
            {
              title: "Total Expenses",
              value: data.totalExpenses,
            },
          ]);

          setRecentUsers(data.recentUsers || []);
          setRecentExpenses(data.recentExpenses || []);
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchDashboard();
  }, [router]);
  const handleLogout = () => {
    localStorage.removeItem("currentUser");

    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    router.push("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}

      <div className="bg-white shadow flex justify-between items-center px-10 py-5">
        <h1 className="text-2xl font-bold text-blue-600">Expense Portal</h1>

        <div className="flex items-center gap-6">
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-gray-500">Admin</p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-5 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}

      <div className="p-10">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Cards */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {dashboardCards.map((card) => (
            <div key={card.title} className="bg-white rounded-xl shadow p-6">
              <p className="text-gray-500">{card.title}</p>

              <h2 className="text-3xl font-bold mt-3">{card.value}</h2>
            </div>
          ))}
        </div>

        {/* Quick Actions */}

        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-5">Quick Actions</h2>

          <div className="flex flex-wrap gap-5">
            <button
              onClick={() => router.push("/admin/users")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg"
            >
              User Management
            </button>

            <button
              onClick={() => router.push("/admin/expenses")}
              className="bg-green-600 text-white px-6 py-3 rounded-lg"
            >
              Company Expenses
            </button>

            <button
              onClick={() => router.push("/admin/analytics")}
              className="bg-yellow-500 text-white px-6 py-3 rounded-lg"
            >
              Analytics
            </button>

            <button
              onClick={() => router.push("/admin/reports")}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg"
            >
              Reports
            </button>
          </div>
        </div>

        {/* Recent Users */}

        <div className="mt-10 bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-semibold mb-5">Recent Users</h2>

          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">Name</th>
                <th className="text-left">Email</th>
                <th className="text-left">Role</th>
              </tr>
            </thead>

            <tbody>
              {recentUsers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-8 text-gray-500">
                    No Users Found
                  </td>
                </tr>
              ) : (
                recentUsers.map((user) => (
                  <tr key={user._id} className="border-b">
                    <td className="py-4">{user?.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Expenses */}

        <div className="mt-10 bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-semibold mb-5">Recent Expenses</h2>

          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">Employee</th>
                <th className="text-left">Expense</th>
                <th className="text-left">Amount</th>
                <th className="text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {recentExpenses.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-500">
                    No Expenses Found
                  </td>
                </tr>
              ) : (
                recentExpenses.map((expense) => (
                  <tr key={expense._id} className="border-b">
                    <td className="py-4">{expense.employeeName}</td>

                    <td>{expense.title}</td>

                    <td>₹{expense.amount}</td>

                    <td>{expense.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
