import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import api from "../../service/api";

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get("/admin/analytics");

        setAnalytics(response.data.analytics);
      } catch (error) {
        console.error("Analytics error:", error);

        setError(error.response?.data?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="flex min-h-screen items-center justify-center">
          <Loader2 size={40} className="animate-spin text-blue-600" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />

        <div className="flex min-h-screen items-center justify-center">
          <p className="text-red-600">{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>

            <p className="mt-1 text-gray-500">Rental and payment analytics</p>
          </div>

          {/* Rentals By Status */}
          <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold">Rentals by Status</h2>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {(analytics?.rentals_by_status || []).map((item) => (
                <div key={item.status} className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">{item.status}</p>

                  <p className="mt-1 text-2xl font-bold">{item.total}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue By Status */}
          <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold">
              Revenue by Rental Status
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left">Status</th>

                    <th className="px-4 py-3 text-left">Rentals</th>

                    <th className="px-4 py-3 text-left">Revenue</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {(analytics?.revenue_by_status || []).map((item) => (
                    <tr key={item.status}>
                      <td className="px-4 py-3">{item.status}</td>

                      <td className="px-4 py-3">{item.total_rentals}</td>

                      <td className="px-4 py-3 font-medium">
                        ₹{Number(item.total_revenue).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Popular Cars */}
          <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold">Most Rented Cars</h2>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left">Car</th>

                    <th className="px-4 py-3 text-left">Registration</th>

                    <th className="px-4 py-3 text-left">Rentals</th>

                    <th className="px-4 py-3 text-left">Revenue</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {(analytics?.popular_cars || []).map((car) => (
                    <tr key={car.car_id}>
                      <td className="px-4 py-3">
                        {car.brand} {car.model}
                      </td>

                      <td className="px-4 py-3">{car.registration_number}</td>

                      <td className="px-4 py-3">{car.total_rentals}</td>

                      <td className="px-4 py-3 font-medium">
                        ₹{Number(car.total_revenue).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold">
              Revenue by Payment Method
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {(analytics?.payment_methods || []).map((item) => (
                <div
                  key={item.payment_method}
                  className="rounded-xl bg-gray-50 p-4"
                >
                  <p className="text-sm text-gray-500">{item.payment_method}</p>

                  <p className="mt-1 text-2xl font-bold">
                    ₹{Number(item.total_amount).toLocaleString("en-IN")}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {item.total_payments} payments
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminAnalytics;
