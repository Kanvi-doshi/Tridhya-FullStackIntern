"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CompanyExpenses() {
  const router = useRouter();

  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [selectedExpense, setSelectedExpense] = useState(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const response = await fetch("/api/admin/expenses");

      const data = await response.json();

      if (response.ok) {
        setExpenses(data.expenses);
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

    const matchesStatus = status === "All" || expense.status === status;

    const matchesCategory = category === "All" || expense.category === category;

    return matchesSearch && matchesStatus && matchesCategory;
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
        <h1 className="text-3xl font-bold mb-8">Company Expenses</h1>

        <div className="flex flex-wrap gap-4 justify-between mb-8">
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

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border p-3 rounded-lg"
            >
              <option>All</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>

            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
                setStatus("All");
              }}
              className="bg-gray-500 text-white px-5 rounded-lg"
            >
              Clear
            </button>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Employee</th>
              <th className="text-left">Expense</th>
              <th className="text-left">Category</th>
              <th className="text-left">Amount</th>
              <th className="text-left">Status</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  No Expenses Found
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
                    <span
                      className={`px-3 py-1 rounded-full text-sm
                      ${
                        expense.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : expense.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {expense.status}
                    </span>
                  </td>

                  <td>
                    <button
                      onClick={() => setSelectedExpense(expense)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedExpense && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white w-[500px] rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Expense Details</h2>

            <div className="space-y-4">
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
                <strong>Date:</strong> {selectedExpense.date}
              </p>

              <p>
                <strong>Status:</strong> {selectedExpense.status}
              </p>

              <p>
                <strong>Description:</strong>
              </p>

              <p className="text-gray-600">{selectedExpense.description}</p>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setSelectedExpense(null)}
                className="bg-red-600 text-white px-5 py-2 rounded-lg"
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
