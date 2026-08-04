"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditUser() {
  const router = useRouter();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Employee",
  });

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();

      if (response.ok) {
        const user = data.users.find((u) => u._id === id);

        if (!user) {
          alert("User not found");
          router.push("/admin/users");
          return;
        }

        setFormData({
          name: user.name,
          email: user.email,
          role: user.role,
        });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: id,
          ...formData,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        router.push("/admin/users");
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
        onClick={() => router.push("/admin/users")}
        className="bg-gray-600 text-white px-5 py-2 rounded-lg mb-8 hover:bg-gray-700"
      >
        ← Back
      </button>

      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold mb-8">Edit User</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}

          <div>
            <label className="block mb-2 font-semibold">Full Name</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Email</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Role</label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
            >
              <option>Employee</option>
              <option>Manager</option>
              <option>Admin</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/users")}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
