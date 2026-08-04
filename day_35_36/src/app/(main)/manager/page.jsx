"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ManagerDashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [dashboardCards, setDashboardCards] = useState([]);
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));

        if (!currentUser) {
          router.push("/login");
          return;
        }

        const response = await fetch(`/api/manager?email=${currentUser.email}`);
        const data = await response.json();
        console.log(data);

        if (response.ok) {
          setUser(data.user);

          setDashboardCards([
            {
              title: "Pending Requests",
              value: data.pendingCount,
            },
            {
              title: "Approved",
              value: data.approvedCount,
            },
            {
              title: "Rejected",
              value: data.rejectedCount,
            },
            {
              title: "Employees",
              value: data.totalEmployees,
            },
          ]);

          setPendingExpenses(data.recentPendingExpenses || []);
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
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

  if (loading) {
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
            <p className="text-sm text-gray-500">Manager</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-5 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="p-10">
        <h1 className="text-3xl font-bold mb-8">Manager Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {dashboardCards.map((card) => (
            <div key={card.title} className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-500">{card.title}</p>

              <h2 className="text-3xl font-bold mt-3">{card.value}</h2>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-5">Quick Actions</h2>

          <button
            onClick={() => router.push("/manager/review-expenses")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Review Requests
          </button>
        </div>

        <div className="mt-10 bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-semibold mb-5">
            Recent Pending Requests
          </h2>

          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">Employee</th>
                <th className="text-left">Expense</th>
                <th className="text-left">Category</th>
                <th className="text-left">Amount</th>
                <th className="text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {pendingExpenses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No Pending Requests
                  </td>
                </tr>
              ) : (
                pendingExpenses.map((expense) => (
                  <tr key={expense._id} className="border-b">
                    <td className="py-4">{expense.employeeName}</td>
                    <td>{expense.title}</td>
                    <td>{expense.category}</td>
                    <td>₹{expense.amount}</td>
                    <td>
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                        {expense.status}
                      </span>
                    </td>
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
