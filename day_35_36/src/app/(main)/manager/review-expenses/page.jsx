"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewExpenses() {
  const router = useRouter();

  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedExpense, setSelectedExpense] = useState(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));

      if (!currentUser) {
        router.push("/login");
        return;
      }
      const response = await fetch(`/api/manager?email=${currentUser.email}`);
      const data = await response.json();

      if (response.ok) {
        setExpenses(data.pendingExpenses || []);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateStatus = async (expenseId, status) => {
    try {
      const response = await fetch("/api/manager", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expenseId,
          status,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        alert(data.message);

        loadExpenses();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      expense.title.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = category === "All" || expense.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      {/* Back Button */}

      <button
        onClick={() => router.push("/manager")}
        className="bg-gray-600 text-white px-5 py-2 rounded-lg mb-6 hover:bg-gray-700"
      >
        ← Back
      </button>

      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold mb-6">Review Expense Requests</h1>

        {/* Search & Filter */}

        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="Search Employee or Expense..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-3 rounded-lg w-80"
          />

          <div className="flex gap-4">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border p-3 rounded-lg"
            >
              <option>All</option>
              <option>Travel</option>
              <option>Food</option>
              <option>Accommodation</option>
              <option>Office Supplies</option>
              <option>Medical</option>
              <option>Other</option>
            </select>

            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="bg-gray-500 text-white px-5 rounded-lg hover:bg-gray-600"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Table */}

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Employee</th>

              <th className="text-left">Expense</th>

              <th className="text-left">Category</th>

              <th className="text-left">Amount</th>

              <th className="text-left">Status</th>

              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  No Pending Requests
                </td>
              </tr>
            ) : (
              filteredExpenses.map((expense) => (
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

                  <td>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setSelectedExpense(expense)}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
                      >
                        View
                      </button>

                      <button
                        onClick={() => updateStatus(expense._id, "Approved")}
                        className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => updateStatus(expense._id, "Rejected")}
                        className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedExpense && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white rounded-xl shadow-lg p-8 w-[500px]">
            <h2 className="text-2xl font-bold mb-6">Expense Details</h2>

            <div className="space-y-3">
              <p>
                <strong>Employee:</strong> {selectedExpense.employeeName}
              </p>

              <p>
                <strong>Expense:</strong> {selectedExpense.title}
              </p>

              <p>
                <strong>Category:</strong> {selectedExpense.category}
              </p>

              <p>
                <strong>Amount:</strong> ₹{selectedExpense.amount}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(selectedExpense.date).toLocaleDateString()}
              </p>

              <p>
                <strong>Status:</strong> {selectedExpense.status}
              </p>
              <div>
                <strong>Description:</strong>

                <p className="mt-2 text-gray-600">
                  {selectedExpense.description}
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setSelectedExpense(null)}
                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
