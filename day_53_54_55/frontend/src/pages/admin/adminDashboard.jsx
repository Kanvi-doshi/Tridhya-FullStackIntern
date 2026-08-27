import { useEffect, useState } from "react";
import { Users, Car, ClipboardList, Loader2, TrendingUp } from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import api from "../../service/api";

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/dashboard");

        console.log("Admin dashboard:", response.data);

        setDashboard(response.data.dashboard);
      } catch (error) {
        console.error("Admin dashboard error:", error);

        setError(error.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

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
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-medium text-red-600">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  const totalUsers = Number(dashboard?.users?.total_users || 0);

  const totalCars = Number(dashboard?.cars?.total_cars || 0);

  const rentedCars = Number(dashboard?.cars?.rented_cars || 0);

  const bookedSlots = Number(dashboard?.bookedSlots || 0);

  const mostRentedCar = dashboard?.mostRentedCar;

  const cards = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
    },
    {
      title: "Total Cars",
      value: totalCars,
      icon: Car,
    },
    {
      title: "Total Rented Cars",
      value: rentedCars,
      icon: Car,
    },
    {
      title: "Booked Slots",
      value: bookedSlots,
      icon: ClipboardList,
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
              Admin Dashboard
            </h1>

            <p className="mt-1 text-gray-500">
              Overview of the car rental system
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="rounded-2xl bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {card.title}
                      </p>

                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        {card.value}
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

          {/* Most Rented Car */}
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                <TrendingUp size={28} />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Most Rented Car
                </p>

                {mostRentedCar ? (
                  <>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {mostRentedCar.brand} {mostRentedCar.model}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {mostRentedCar.registration_number}
                    </p>

                    <p className="mt-1 text-sm font-medium text-purple-600">
                      {Number(mostRentedCar.rental_count || 0)} rentals
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-lg font-semibold text-gray-700">
                    No rental data available
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
