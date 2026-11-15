import { useEffect, useState } from "react";
import {
  CalendarDays,
  Car,
  Clock3,
  CreditCard,
  XCircle,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import api from "../../service/api";

const MyRentals = () => {
  const navigate = useNavigate();

  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const response = await api.get("/rentals/my");

        setRentals(response.data.rentals || []);
      } catch (error) {
        console.error("Failed to fetch rentals:", error);

        setError(
          error.response?.data?.message || "Failed to load your rentals",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRentals();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-100 text-emerald-700";

      case "Confirmed":
        return "bg-blue-100 text-blue-700";

      case "Pending":
        return "bg-amber-100 text-amber-700";

      case "Completed":
        return "bg-slate-100 text-slate-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleCancel = async (rentalId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this rental?",
    );

    if (!confirmed) return;

    try {
      await api.put(`/rentals/${rentalId}/cancel`);

      setRentals((currentRentals) =>
        currentRentals.map((rental) =>
          rental.rental_id === rentalId
            ? { ...rental, status: "Cancelled" }
            : rental,
        ),
      );
    } catch (error) {
      console.error("Cancel rental error:", error);

      alert(error.response?.data?.message || "Failed to cancel rental");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-1 text-sm font-medium text-blue-600">Customer</p>

          <h1 className="text-3xl font-bold text-slate-900">My Rentals</h1>

          <p className="mt-2 text-slate-500">
            View and manage your current and previous rentals.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-60 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading rentals...
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && rentals.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <Car className="mx-auto h-12 w-12 text-slate-400" />

            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              No rentals yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              You haven't rented a car yet. Browse our available cars to get
              started.
            </p>

            <button
              onClick={() => navigate("/cars")}
              className="mt-6 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Browse Cars
            </button>
          </div>
        )}

        {/* Rentals */}
        {!loading && !error && rentals.length > 0 && (
          <div className="space-y-5">
            {rentals.map((rental) => (
              <div
                key={rental.rental_id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                {/* Top */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                      <Car className="h-6 w-6 text-blue-600" />
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {rental.brand} {rental.model}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Registration: {rental.registration_number}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Rental #{rental.rental_id}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                      rental.status,
                    )}`}
                  >
                    {rental.status}
                  </span>
                </div>

                {/* Details */}
                <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-slate-400" />

                    <div>
                      <p className="text-xs text-slate-400">Start Date</p>

                      <p className="text-sm font-medium text-slate-800">
                        {formatDate(rental.start_date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock3 className="h-5 w-5 text-slate-400" />

                    <div>
                      <p className="text-xs text-slate-400">End Date</p>

                      <p className="text-sm font-medium text-slate-800">
                        {formatDate(rental.end_date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-slate-400" />

                    <div>
                      <p className="text-xs text-slate-400">Total Amount</p>

                      <p className="text-sm font-semibold text-slate-900">
                        ₹{Number(rental.total_amount).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {/* Actions */}
                {rental.status !== "Completed" &&
                  rental.status !== "Cancelled" && (
                    <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
                      {/* Pay Now */}
                      {rental.payment_status === "Pending" && (
                        <button
                          onClick={() =>
                            navigate("/payments", {
                              state: { rentalId: rental.rental_id },
                            })
                          }
                          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                          <CreditCard className="h-4 w-4" />
                          Pay Now
                        </button>
                      )}

                      {/* Cancel Rental */}
                      {rental.payment_status !== "Completed" && (
                        <button
                          onClick={() => handleCancel(rental.rental_id)}
                          className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Cancel Rental
                        </button>
                      )}
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyRentals;
