import {
  Car,
  CalendarDays,
  CreditCard,
  Clock3,
  ArrowRight,
  Search,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import apiRequest from "../../service/api";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({
    activeRentals: 0,
    upcomingRentals: 0,
    totalPayments: 0,
    pendingRentals: 0,
  });

useEffect(() => {
  const fetchStats = async () => {
    try {
      const response = await apiRequest.get("/rentals/dashboard");

      setStats(response.data.stats);
    } catch (error) {
      console.error("Failed to fetch customer stats:", error);
    }
  };

  fetchStats();
}, []);

  const statCards = [
    {
      title: "Active Rentals",
      value: stats.activeRentals,
      icon: Car,
    },
    {
      title: "Upcoming Rentals",
      value: stats.upcomingRentals,
      icon: CalendarDays,
    },
    {
      title: "Total Payments",
      value: `₹${stats.totalPayments.toLocaleString("en-IN")}`,
      icon: CreditCard,
    },
    {
      title: "Pending Rentals",
      value: stats.pendingRentals,
      icon: Clock3,
    },
  ];
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome */}
        <section className="mb-8">
          <p className="mb-1 text-sm font-medium text-blue-600">
            Customer Dashboard
          </p>

          <h1 className="text-3xl font-bold text-slate-900">Welcome back!</h1>

          <p className="mt-2 text-slate-500">
            Manage your rentals, payments, and find your next car.
          </p>
        </section>

        {/* Search Cars */}
        <section className="mb-8 rounded-2xl bg-blue-600 p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-white">
              Find your perfect car
            </h2>

            <p className="mt-1 text-sm text-blue-100">
              Search and browse available cars for your next trip.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by brand, model or registration number"
                className="w-full rounded-lg border-0 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400"
              />
            </div>

            <button
              onClick={() =>
                navigate(`/cars?search=${encodeURIComponent(search)}`)
              }
              className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Search Cars
            </button>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.title}</p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Quick Actions */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Quick Actions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage your car rentals easily.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Browse Cars */}
            <button
              onClick={() => navigate("/cars")}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <Car className="h-6 w-6 text-blue-600" />
              </div>

              <h3 className="font-semibold text-slate-900">Browse Cars</h3>

              <p className="mt-2 text-sm text-slate-500">
                Explore available cars and find the right one for your trip.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-medium text-blue-600">
                View Cars
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </button>

            {/* My Rentals */}
            <button
              onClick={() => navigate("/rentals")}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                <CalendarDays className="h-6 w-6 text-emerald-600" />
              </div>

              <h3 className="font-semibold text-slate-900">My Rentals</h3>

              <p className="mt-2 text-sm text-slate-500">
                View your current and previous car rental bookings.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-medium text-emerald-600">
                View Rentals
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </button>

            {/* Payments */}
            <button
              onClick={() => navigate("/payments")}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50">
                <CreditCard className="h-6 w-6 text-violet-600" />
              </div>

              <h3 className="font-semibold text-slate-900">Payments</h3>

              <p className="mt-2 text-sm text-slate-500">
                Check your payment history and payment status.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-medium text-violet-600">
                View Payments
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CustomerDashboard;
