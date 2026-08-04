"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddExpense() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    amount: "",
    date: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));

      if (!currentUser) {
        alert("Please login again");
        router.push("/login");
        return;
      }

      const response = await fetch("/api/employee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId: currentUser.id,
          employeeName: currentUser.name,
          ...formData,
          amount: Number(formData.amount),
          status: "Pending",
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Expense Added Successfully!");

        router.push("/employee/my-expenses");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);

      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <button
        onClick={() => router.push("/employee")}
        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition "
      >
        ← Back
      </button>
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-5">
        <h1 className="text-3xl font-bold mb-8">Add Expense</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="title"
            placeholder="Expense Title"
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
            <option value="">Select Category</option>
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
            placeholder="Amount"
            min={0}
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
            Submit Expense
          </button>
        </form>
      </div>
    </div>
  );
}
