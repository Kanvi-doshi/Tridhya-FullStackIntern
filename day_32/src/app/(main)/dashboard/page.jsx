"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    setUser(currentUser);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }
  const handleLogout = () => {
    // Remove logged-in user
    localStorage.removeItem("currentUser");

    // Remove cookies
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Redirect
    router.push("/login");
  };

  const renderCards = () => {
    switch (user.role) {
      case "Employee":
        return (
          <>
            <Card title="Total Expenses" value="12" />
            <Card title="Pending Requests" value="3" />
            <Card title="Approved Requests" value="9" />
          </>
        );

      case "Manager":
        return (
          <>
            <Card title="Team Expenses" value="48" />
            <Card title="Pending Approvals" value="7" />
            <Card title="Team Members" value="15" />
          </>
        );

      case "Admin":
        return (
          <>
            <Card title="Total Users" value="100" />
            <Card title="Total Expenses" value="₹2,50,000" />
            <Card title="Company Analytics" value="Active" />
          </>
        );

      default:
        return <p>No Role Found</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-4xl font-bold mb-2">Welcome, {user.name}</h1>

      <p className="text-gray-600 mb-8">Role: {user.role}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderCards()}
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded-lg"
      >
        Logout
      </button>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-lg text-gray-500">{title}</h2>

      <p className="text-3xl font-bold mt-4">{value}</p>
    </div>
  );
}
