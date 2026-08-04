"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditExpense() {
  const router = useRouter();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    amount: "",
    date: "",
  });

  useEffect(() => {
    const expenses = JSON.parse(localStorage.getItem("expenses")) || [];

    const expense = expenses.find((expense) => expense.id === Number(id));

    if (expense) {
      setFormData({
        title: expense.title,
        category: expense.category,
        amount: expense.amount,
        date: expense.date,
      });
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const expenses = JSON.parse(localStorage.getItem("expenses")) || [];

    const updatedExpenses = expenses.map((expense) => {
      if (expense.id === Number(id)) {
        return {
          ...expense,
          ...formData,
          amount: Number(formData.amount),
        };
      }

      return expense;
    });

    localStorage.setItem("expenses", JSON.stringify(updatedExpenses));

    alert("Expense Updated Successfully!");

    router.push("/employee/my-expenses");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <button
        onClick={() => router.back("/my-expenses")}
        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
      >
        ← Back
      </button>

      <div className="max-w-xl mx-auto bg-white p-5 rounded-xl shadow">
        <h1 className="text-3xl font-bold mb-5">Edit Expense</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
            required
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
            required
          >
            <option>Travel</option>
            <option>Food</option>
            <option>Accommodation</option>
            <option>Office Supplies</option>
            <option>Medical</option>
            <option>Other</option>
          </select>

          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
            required
          />

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            Update Expense
          </button>
        </form>
      </div>
    </div>
  );
}
