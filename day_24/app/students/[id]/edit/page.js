"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditStudent() {
  const router = useRouter();
  const params = useParams();

  const [name, setName] = useState("");
  const [course, setCourse] = useState("");

  useEffect(() => {
    async function fetchStudent() {
      const res = await fetch(`http://localhost:4000/students/${params.id}`);

      const data = await res.json();

      setName(data.name);
      setCourse(data.course);
    }

    if (params.id) {
      fetchStudent();
    }
  }, [params.id]);

  async function handleSubmit(e) {
    e.preventDefault();

    await fetch(`http://localhost:4000/students/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: Number(params.id),
        name,
        course,
      }),
    });

    alert("Student Updated");

    router.push("/students");
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white p-10 rounded-2xl shadow-xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-slate-800">
          Edit Student
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 px-5 py-4 rounded-xl text-lg text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />

          <input
            type="text"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="w-full border border-gray-300 px-5 py-4 rounded-xl text-lg text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-4 rounded-xl font-semibold text-lg transition"
          >
            Update Student
          </button>
        </form>
      </div>
    </div>
  );
}
