"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddStudent() {
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !course) {
      alert("Please fill all fields");
      return;
    }

    console.log({
      name,
      course,
    });
    await fetch("http://localhost:4000/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        course,
      }),
    });

    alert("Student Added Successfully");

    setName("");
    setCourse("");

    router.push("/students");
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white p-10 rounded-2xl shadow-xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-slate-800">
          Add Student
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input
            type="text"
            placeholder="Student Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 px-5 py-4 rounded-xl text-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            placeholder="Course"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="w-full border border-gray-300 px-5 py-4 rounded-xl text-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg transition"
          >
            Add Student
          </button>
        </form>
      </div>
    </div>
  );
}
