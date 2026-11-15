import { useEffect, useState } from "react";
import { Loader2, Search, Eye, CheckCircle2, XCircle, X } from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import api from "../../service/api";

const StaffRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const totalRentals = rentals.length;

  const pendingRentals = rentals.filter(
    (rental) => rental.status === "Pending",
  ).length;

  const confirmedRentals = rentals.filter(
    (rental) => rental.status === "Confirmed",
  ).length;

  const activeRentals = rentals.filter(
    (rental) => rental.status === "Active",
  ).length;

  const completedRentals = rentals.filter(
    (rental) => rental.status === "Completed",
  ).length;

  const cancelledRentals = rentals.filter(
    (rental) => rental.status === "Cancelled",
  ).length;

  const handleViewRental = (rental) => {
    setSelectedRental(rental);
    setShowViewModal(true);
  };

  const fetchRentals = async () => {
    try {
      setLoading(true);

      const response = await api.get("/rentals");

      setRentals(response.data.rentals || []);
    } catch (error) {
      console.error("Fetch rentals error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const updateStatus = async (rentalId, status) => {
    try {
      await api.put(`/rentals/${rentalId}/status`, {
        status,
      });

      fetchRentals();
    } catch (error) {
      console.error("Update rental status error:", error);

      alert(error.response?.data?.message || "Failed to update rental status");
    }
  };

  const filteredRentals = rentals.filter((rental) => {
    const value = search.toLowerCase();

    return (
      rental.brand?.toLowerCase().includes(value) ||
      rental.model?.toLowerCase().includes(value) ||
      rental.registration_number?.toLowerCase().includes(value) ||
      String(rental.rental_id).includes(value)
    );
  });

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";

      case "Confirmed":
        return "bg-blue-100 text-blue-700";

      case "Active":
        return "bg-green-100 text-green-700";

      case "Completed":
        return "bg-gray-100 text-gray-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Rentals</h1>

            <p className="mt-1 text-gray-500">Manage customer rentals</p>
          </div>
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">Total</p>
              <p className="mt-1 text-2xl font-bold">{totalRentals}</p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="mt-1 text-2xl font-bold text-yellow-600">
                {pendingRentals}
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">Confirmed</p>
              <p className="mt-1 text-2xl font-bold text-blue-600">
                {confirmedRentals}
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">Active</p>
              <p className="mt-1 text-2xl font-bold text-green-600">
                {activeRentals}
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="mt-1 text-2xl font-bold">{completedRentals}</p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">Cancelled</p>
              <p className="mt-1 text-2xl font-bold text-red-600">
                {cancelledRentals}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6 max-w-md">
            <div className="relative">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search rentals..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={40} className="animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
              <table className="min-w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      Rental
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      Car
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      Dates
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      Payment
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredRentals.map((rental) => (
                    <tr key={rental.rental_id}>
                      <td className="px-5 py-4">#{rental.rental_id}</td>

                      <td className="px-5 py-4">
                        <p className="font-medium">
                          {rental.brand} {rental.model}
                        </p>

                        <p className="text-sm text-gray-500">
                          {rental.registration_number}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {new Date(rental.start_date).toLocaleDateString()} -{" "}
                        {new Date(rental.end_date).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 font-medium">
                        ₹{Number(rental.total_amount).toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm">
                          {rental.payment_status || "Pending"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                            rental.status,
                          )}`}
                        >
                          {rental.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          {rental.status === "Pending" && (
                            <button
                              onClick={() =>
                                updateStatus(rental.rental_id, "Confirmed")
                              }
                              title="Confirm"
                              className="rounded-lg bg-green-100 p-2 text-green-700 hover:bg-green-200"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                          )}

                          {rental.status !== "Cancelled" &&
                            rental.status !== "Completed" && (
                              <button
                                onClick={() =>
                                  updateStatus(rental.rental_id, "Cancelled")
                                }
                                title="Cancel"
                                className="rounded-lg bg-red-100 p-2 text-red-700 hover:bg-red-200"
                              >
                                <XCircle size={18} />
                              </button>
                            )}

                          <button
                            onClick={() => handleViewRental(rental)}
                            className="rounded-lg bg-gray-100 p-2 text-gray-700 hover:bg-gray-200"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* VIEW RENTAL MODAL */}
      {showViewModal && selectedRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Rental Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Rental #{selectedRental.rental_id}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedRental(null);
                }}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Rental Information */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Car */}
              {/* Customer Details */}
              <div className="rounded-xl bg-gray-50 p-4 sm:col-span-2">
                <p className="text-sm font-medium text-gray-500">Customer</p>

                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {selectedRental.first_name} {selectedRental.last_name}
                </p>

                <div className="mt-2 space-y-1 text-sm text-gray-500">
                  <p>Email: {selectedRental.email}</p>

                  <p>Phone: {selectedRental.phone || "Not provided"}</p>
                </div>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Car</p>

                <p className="mt-1 font-semibold text-gray-900">
                  {selectedRental.brand} {selectedRental.model}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedRental.registration_number}
                </p>
              </div>

              {/* Rental Status */}
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Rental Status</p>

                <span
                  className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                    selectedRental.status,
                  )}`}
                >
                  {selectedRental.status}
                </span>
              </div>

              {/* Start Date */}
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Start Date</p>

                <p className="mt-1 font-medium text-gray-900">
                  {new Date(selectedRental.start_date).toLocaleString()}
                </p>
              </div>

              {/* End Date */}
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">End Date</p>

                <p className="mt-1 font-medium text-gray-900">
                  {new Date(selectedRental.end_date).toLocaleString()}
                </p>
              </div>

              {/* Amount */}
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Total Amount</p>

                <p className="mt-1 font-semibold text-gray-900">
                  ₹{Number(selectedRental.total_amount).toLocaleString("en-IN")}
                </p>
              </div>

              {/* Payment Method */}
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Payment Method</p>

                <p className="mt-1 font-medium text-gray-900">
                  {selectedRental.payment_method || "Not selected"}
                </p>
              </div>

              {/* Payment Status */}
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Payment Status</p>

                <p
                  className={`mt-1 font-semibold ${
                    selectedRental.payment_status === "Completed"
                      ? "text-green-600"
                      : selectedRental.payment_status === "Failed"
                        ? "text-red-600"
                        : "text-yellow-600"
                  }`}
                >
                  {selectedRental.payment_status || "Pending"}
                </p>
              </div>

              {/* Paid At */}
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Paid At</p>

                <p className="mt-1 font-medium text-gray-900">
                  {selectedRental.paid_at
                    ? new Date(selectedRental.paid_at).toLocaleString()
                    : "Not paid yet"}
                </p>
              </div>
            </div>

            {/* Close */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedRental(null);
                }}
                className="rounded-lg bg-gray-800 px-5 py-2.5 text-white hover:bg-gray-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StaffRentals;
