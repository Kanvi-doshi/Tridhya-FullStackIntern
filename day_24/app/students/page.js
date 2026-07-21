"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/students")
      .then((res) => res.json())
      .then((data) => setStudents(data));
  }, []);

  async function deleteStudent(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?",
    );

    if (!confirmDelete) return;
    await fetch(`http://localhost:4000/students/${id}`, {
      method: "DELETE",
    });

    setStudents(students.filter((student) => student.id !== id));
  }
  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-slate-800">
          Students ({students.length})
        </h1>

        <Link
          href="/students/add"
          className="bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-xl shadow"
        >
          Add Student
        </Link>
      </div>

      <div className="space-y-4">
        {students.map((student) => (
          <div
            key={student.id}
            className="bg-white rounded-xl shadow-md p-5 flex justify-between items-center hover:shadow-xl transition"
          >
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                {student.name}
              </h3>
              <p className="text-slate-500">{student.course}</p>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/students/${student.id}/edit`}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition"
              >
                Edit
              </Link>

              <button
                onClick={() => deleteStudent(student.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
