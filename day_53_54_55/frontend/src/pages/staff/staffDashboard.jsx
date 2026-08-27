import { useEffect, useState } from "react";
import { Car, CreditCard, IndianRupee, Loader2 } from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import api from "../../service/api";

const StaffDashboard = () => {
  const [cars, setCars] = useState([]);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [carsResponse, paymentsResponse] = await Promise.all([
          api.get("/cars"),
          api.get("/payments"),
        ]);

        setCars(carsResponse.data.cars || []);
        setPayments(paymentsResponse.data.payments || []);
      } catch (error) {
        console.error("Staff dashboard error:", error);

        setError(
          error.response?.data?.message || "Failed to load dashboard data",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // CAR STATS
  const totalCars = cars.length;

  const availableCars = cars.filter((car) => car.status === "Available").length;

  const rentedCars = cars.filter((car) => car.status === "Rented").length;

  // PAYMENT STATS
  const completedPayments = payments.filter(
    (payment) => payment.payment_status === "Completed",
  );

  const completedPaymentCount = completedPayments.length;

  const totalRevenue = completedPayments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0,
  );

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <Loader2 size={40} className="animate-spin text-blue-600" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />

        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-medium text-red-600">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  const stats = [
    {
      title: "Total Cars",
      value: totalCars,
      icon: Car,
    },
    {
      title: "Available Cars",
      value: availableCars,
      icon: Car,
    },
    {
      title: "Rented Cars",
      value: rentedCars,
      icon: Car,
    },
    {
      title: "Completed Payments",
      value: completedPaymentCount,
      icon: CreditCard,
    },
  ];

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Staff Dashboard
            </h1>

            <p className="mt-1 text-gray-500">Overview of cars and payments</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-2xl bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {stat.title}
                      </p>

                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>

                    <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                      <Icon size={24} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Revenue */}
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-green-50 p-3 text-green-600">
                <IndianRupee size={28} />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Completed Revenue
                </p>

                <p className="mt-1 text-3xl font-bold text-gray-900">
                  ₹{totalRevenue.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffDashboard;
