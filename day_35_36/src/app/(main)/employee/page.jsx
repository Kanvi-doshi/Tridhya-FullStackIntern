"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EmployeeDashboard() {
  const router = useRouter();
  const [dashboardCards, setDashboardCards] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);

  const [user, setUser] = useState(null);

 useEffect(() => {
   const fetchDashboard = async () => {
     try {
       const currentUser = JSON.parse(localStorage.getItem("currentUser"));

       if (!currentUser) {
         router.push("/login");
         return;
       }

       setUser(currentUser);

       const response = await fetch(`/api/employee?email=${currentUser.email}`);

       const data = await response.json();

       if (response.ok) {
         setUser(data.user);

         setDashboardCards([
           {
             title: "Total Expenses",
             value: data.totalExpenses,
           },
           {
             title: "Pending Requests",
             value: data.pendingExpenses,
           },
           {
             title: "Approved",
             value: data.approvedExpenses,
           },
           {
             title: "Rejected",
             value: data.rejectedExpenses,
           },
         ]);

         setRecentExpenses(data.recentExpenses || []);
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}

      <div className="bg-white shadow flex justify-between items-center px-10 py-5">
        <div>
          <h1 className="text-2xl font-bold text-blue-600">Expense Portal</h1>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <p className="font-semibold">{user?.name}</p>

            <p className="text-sm text-gray-500">Employee</p>
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
        <h2 className="text-3xl font-bold mb-8">Employee Dashboard</h2>

        {/* Cards */}

        <div className="grid grid-cols-4 gap-6">
          {dashboardCards.map((card) => (
            <div key={card.title} className="bg-white rounded-xl shadow p-6">
              <p className="text-gray-500">{card.title}</p>

              <h1 className="text-3xl font-bold mt-3">{card.value}</h1>
            </div>
          ))}
        </div>

        {/* Quick Actions */}

        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-5">Quick Actions</h2>

          <div className="flex gap-5">
            <button
              onClick={() => router.push("/employee/add-expense")}
              className="bg-blue-600 text-white px-5 py-3 rounded-lg"
            >
              Add Expense
            </button>

            <button
              onClick={() => router.push("/employee/my-expenses")}
              className="bg-green-600 text-white px-5 py-3 rounded-lg"
            >
              My Expenses
            </button>
          </div>
        </div>

        {/* Table */}

        <div className="mt-10 bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-semibold mb-5">Recent Expenses</h2>

          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">Expense</th>

                <th className="text-left">Category</th>

                <th className="text-left">Amount</th>

                <th className="text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentExpenses.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-500">
                    No expenses submitted yet.
                  </td>
                </tr>
              ) : (
                recentExpenses.map((expense) => (
                  <tr key={expense._id} className="border-b">
                    <td className="py-4">{expense.title}</td>

                    <td>{expense.category}</td>

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
