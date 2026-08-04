"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MyExpenses() {
  const router = useRouter();
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!currentUser) {
          router.push("/login");
          return;
        }
        const employeeId = currentUser.id || currentUser._id;
        const response = await fetch(
          `/api/expenses?employeeId=${employeeId}`,
        );
        const data = await response.json();
        if (response.ok) {
          setExpenses(data.expenses || []);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchExpenses();
  }, [router]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this expense?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch("/api/expenses", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setExpenses((prev) => prev.filter((expense) => expense._id !== id));

        alert("Expense Deleted Successfully!");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <button
        onClick={() => router.push("/employee")}
        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition mb-10 "
      >
        ← Back
      </button>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Expenses</h1>

        <button
          onClick={() => router.push("/employee/add-expense")}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg"
        >
          + Add Expense
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Amount</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  No expenses found.
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense._id} className="border-t">
                  <td className="p-4">{expense.title}</td>
                  <td className="p-4">{expense.category}</td>
                  <td className="p-4">₹{expense.amount}</td>
                  <td className="p-4">{expense.date}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-white text-sm ${
                        expense.status === "Approved"
                          ? "bg-green-500"
                          : expense.status === "Rejected"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                      }`}
                    >
                      {expense.status}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    {expense.status === "Pending" && (
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() =>
                            router.push(`/employee/edit-expense/${expense._id}`)
                          }
                          className="bg-green-600 text-white px-4 py-2 rounded"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(expense._id)}
                          className="bg-red-600 text-white px-4 py-2 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
