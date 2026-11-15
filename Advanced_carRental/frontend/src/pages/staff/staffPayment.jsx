import { useEffect, useState } from "react";
import { Loader2, CreditCard, Search, Eye, X } from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import api from "../../service/api";

const StaffPayments = () => {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const response = await api.get("/payments");

      setPayments(response.data.payments || []);
    } catch (error) {
      console.error("Fetch payments error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((payment) => {
    const value = search.toLowerCase();

    return (
      String(payment.payment_id).includes(value) ||
      String(payment.rental_id).includes(value) ||
      payment.payment_method?.toLowerCase().includes(value) ||
      payment.payment_status?.toLowerCase().includes(value)
    );
  });

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";

      case "Pending":
        return "bg-yellow-100 text-yellow-700";

      case "Failed":
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
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>

            <p className="mt-1 text-gray-500">View customer payment records</p>
          </div>

          <div className="mb-6 max-w-md">
            <div className="relative">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search payments..."
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
                      Payment
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      Rental
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      Method
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      Paid At
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      View
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.payment_id}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                            <CreditCard size={18} />
                          </div>
                          #{payment.payment_id}
                        </div>
                      </td>

                      <td className="px-5 py-4">#{payment.rental_id}</td>

                      <td className="px-5 py-4 font-medium">
                        ₹{Number(payment.amount).toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4">
                        {payment.payment_method || "Not selected"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                            payment.payment_status,
                          )}`}
                        >
                          {payment.payment_status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {payment.paid_at
                          ? new Date(payment.paid_at).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleViewPayment(payment)}
                          title="View Payment"
                          className="rounded-lg bg-gray-100 p-2 text-gray-700 hover:bg-gray-200"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredPayments.length === 0 && (
            <div className="rounded-xl bg-white p-10 text-center shadow-sm">
              <p className="text-gray-500">No payments found.</p>
            </div>
          )}
        </div>
      </div>
      {/* VIEW PAYMENT MODAL */}
      {showViewModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Payment Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Payment #{selectedPayment.payment_id}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedPayment(null);
                }}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Customer */}
              <div className="rounded-xl bg-gray-50 p-4 sm:col-span-2">
                <p className="text-sm text-gray-500">Customer</p>

                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {selectedPayment.first_name} {selectedPayment.last_name}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedPayment.email}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedPayment.phone || "No phone number"}
                </p>
              </div>

              {/* Rental */}
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Rental</p>

                <p className="mt-1 font-semibold text-gray-900">
                  #{selectedPayment.rental_id}
                </p>
              </div>

              {/* Car */}
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Car</p>

                <p className="mt-1 font-semibold text-gray-900">
                  {selectedPayment.brand} {selectedPayment.model}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedPayment.registration_number}
                </p>
              </div>

              {/* Amount */}
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Amount</p>

                <p className="mt-1 text-lg font-semibold text-gray-900">
                  ₹{Number(selectedPayment.amount).toLocaleString("en-IN")}
                </p>
              </div>

              {/* Payment Method */}
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Payment Method</p>

                <p className="mt-1 font-medium text-gray-900">
                  {selectedPayment.payment_method || "Not selected"}
                </p>
              </div>

              {/* Payment Status */}
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Payment Status</p>

                <p
                  className={`mt-1 font-semibold ${
                    selectedPayment.payment_status === "Completed"
                      ? "text-green-600"
                      : selectedPayment.payment_status === "Failed"
                        ? "text-red-600"
                        : "text-yellow-600"
                  }`}
                >
                  {selectedPayment.payment_status}
                </p>
              </div>

              {/* Paid At */}
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Paid At</p>

                <p className="mt-1 font-medium text-gray-900">
                  {selectedPayment.paid_at
                    ? new Date(selectedPayment.paid_at).toLocaleString()
                    : "Not paid yet"}
                </p>
              </div>
            </div>

            {/* Close */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedPayment(null);
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

export default StaffPayments;
