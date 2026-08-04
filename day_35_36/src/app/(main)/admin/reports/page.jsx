"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Reports() {
  const router = useRouter();

  const [report, setReport] = useState(null);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      const response = await fetch("/api/admin/reports");
      const data = await response.json();

      if (response.ok) {
        setReport(data.report);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to load report");
    }
  };

  if (!report) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <button
        onClick={() => router.push("/admin")}
        className="bg-gray-600 text-white px-5 py-2 rounded-lg mb-8"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-8">Company Expense Report</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Total Users</h2>
          <p className="text-3xl font-bold">{report.totalUsers}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Employees</h2>
          <p className="text-3xl font-bold">{report.totalEmployees}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Managers</h2>
          <p className="text-3xl font-bold">{report.totalManagers}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Admins</h2>
          <p className="text-3xl font-bold">{report.totalAdmins}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Total Expenses</h2>
          <p className="text-3xl font-bold">{report.totalExpenses}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Pending</h2>
          <p className="text-3xl font-bold text-yellow-600">
            {report.pendingExpenses}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Approved</h2>
          <p className="text-3xl font-bold text-green-600">
            {report.approvedExpenses}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Rejected</h2>
          <p className="text-3xl font-bold text-red-600">
            {report.rejectedExpenses}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-8">
        <h2 className="text-2xl font-bold mb-4">Financial Summary</h2>

        <p className="text-xl">
          <strong>Total Amount Claimed:</strong> ₹{report.totalAmount}
        </p>
      </div>
    </div>
  );
}
