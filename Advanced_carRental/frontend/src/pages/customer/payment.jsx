import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CreditCard,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock3,
  XCircle,
  Loader2,
  Smartphone,
  Banknote,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../service/api";

const Payments = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const rentalId = location.state?.rentalId;

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get("/payments/my");

        setPayments(response.data.payments || []);
      } catch (error) {
        console.error("Failed to fetch payments:", error);

        setError(
          error.response?.data?.message || "Failed to load payment history",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-700";

      case "Pending":
        return "bg-amber-100 text-amber-700";

      case "Failed":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return CheckCircle2;

      case "Pending":
        return Clock3;

      case "Failed":
        return XCircle;

      default:
        return Clock3;
    }
  };
  const handlePayment = async (e) => {
    e.preventDefault();
    setError("");

    if (!paymentMethod) {
      setError("Please select a payment method.");
      return;
    }

    try {
      setSubmitting(true);

      await api.put(`/payments/${selectedPayment.payment_id}`, {
        payment_method: paymentMethod,
        payment_status: "Completed",
      });

      setPayments((currentPayments) =>
        currentPayments.map((payment) =>
          payment.payment_id === selectedPayment.payment_id
            ? {
                ...payment,
                payment_method: paymentMethod,
                payment_status: "Completed",
                paid_at: new Date().toISOString(),
              }
            : payment,
        ),
      );

      setSelectedPayment(null);
      setPaymentMethod("");
    } catch (error) {
      console.error("Payment error:", error);

      setError(
        error.response?.data?.message || "Payment failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (rentalId && !paymentSuccess) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />

        <main className="mx-auto max-w-2xl px-6 py-8">
          <button
            onClick={() => navigate("/cars")}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Back to Cars
          </button>

          <section className="mb-8">
            <p className="mb-1 text-sm font-medium text-blue-600">Payment</p>

            <h1 className="text-3xl font-bold text-slate-900">
              Complete Payment
            </h1>

            <p className="mt-2 text-slate-500">
              Select your preferred payment method to confirm your rental.
            </p>
          </section>

          <form
            onSubmit={handlePayment}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            {/* Rental */}
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400">Rental ID</p>

              <p className="mt-1 text-lg font-semibold text-slate-900">
                #{rentalId}
              </p>
            </div>

            {/* Payment Method */}
            <div className="mt-6">
              <label className="mb-3 block text-sm font-semibold text-slate-700">
                Select Payment Method
              </label>

              <div className="grid grid-cols-3 gap-3">
                {/* Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Card")}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium transition ${
                    paymentMethod === "Card"
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-slate-200 text-slate-700 hover:border-blue-300"
                  }`}
                >
                  <CreditCard className="h-6 w-6" />
                  Card
                </button>

                {/* UPI */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium transition ${
                    paymentMethod === "UPI"
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-slate-200 text-slate-700 hover:border-blue-300"
                  }`}
                >
                  <Smartphone className="h-6 w-6" />
                  UPI
                </button>

                {/* Cash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Cash")}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium transition ${
                    paymentMethod === "Cash"
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-slate-200 text-slate-700 hover:border-blue-300"
                  }`}
                >
                  <Banknote className="h-6 w-6" />
                  Cash
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            {/* Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/cars")}
                className="flex-1 rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Processing..." : "Confirm Payment"}
              </button>
            </div>
          </form>
        </main>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <section className="mb-8">
          <p className="mb-1 text-sm font-medium text-blue-600">Customer</p>

          <h1 className="text-3xl font-bold text-slate-900">Payments</h1>

          <p className="mt-2 text-slate-500">
            View your payment history and transaction details.
          </p>
        </section>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-60 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading payments...
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
        {!loading && !error && payments.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-slate-400" />

            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              No payments yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Your payment transactions will appear here.
            </p>
          </div>
        )}

        {/* Payments */}
        {!loading && !error && payments.length > 0 && (
          <div className="space-y-5">
            {payments.map((payment) => {
              const StatusIcon = getStatusIcon(payment.payment_status);

              return (
                <div
                  key={payment.payment_id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  {/* Top */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50">
                        <CreditCard className="h-6 w-6 text-violet-600" />
                      </div>

                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                          {payment.brand} {payment.model}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Rental #{payment.rental_id}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Payment #{payment.payment_id}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                        payment.payment_status,
                      )}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />

                      {payment.payment_status}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-6 grid grid-cols-1 gap-5 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Amount */}
                    <div>
                      <p className="text-xs text-slate-400">Amount</p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        ₹{Number(payment.amount).toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* Payment Method */}
                    <div className="flex items-start gap-3">
                      <CreditCard className="mt-0.5 h-5 w-5 text-slate-400" />

                      <div>
                        <p className="text-xs text-slate-400">Payment Method</p>

                        <p className="mt-1 text-sm font-medium text-slate-800">
                          {payment.payment_method}
                        </p>
                      </div>
                    </div>

                    {/* Rental Dates */}
                    <div className="flex items-start gap-3">
                      <CalendarDays className="mt-0.5 h-5 w-5 text-slate-400" />

                      <div>
                        <p className="text-xs text-slate-400">Rental Period</p>

                        <p className="mt-1 text-sm font-medium text-slate-800">
                          {formatDate(payment.start_date)}
                        </p>

                        <p className="text-xs text-slate-500">
                          to {formatDate(payment.end_date)}
                        </p>
                      </div>
                    </div>

                    {/* Paid At */}
                    <div className="flex items-start gap-3">
                      <Car className="mt-0.5 h-5 w-5 text-slate-400" />

                      <div>
                        <p className="text-xs text-slate-400">Paid On</p>

                        <p className="mt-1 text-sm font-medium text-slate-800">
                          {formatDate(payment.paid_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {payment.payment_status === "Pending" && (
                    <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setPaymentMethod("");
                          setError("");
                        }}
                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Pay Now
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {selectedPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Complete Payment
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Rental #{selectedPayment.rental_id}
                </p>
              </div>

              {/* Amount */}
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">Amount</p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  ₹{Number(selectedPayment.amount).toLocaleString("en-IN")}
                </p>
              </div>

              <form onSubmit={handlePayment}>
                {/* Payment Method */}
                <div className="mt-6">
                  <label className="mb-3 block text-sm font-semibold text-slate-700">
                    Select Payment Method
                  </label>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Card")}
                      className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium ${
                        paymentMethod === "Card"
                          ? "border-blue-600 bg-blue-50 text-blue-600"
                          : "border-slate-200 text-slate-700"
                      }`}
                    >
                      <CreditCard className="h-6 w-6" />
                      Card
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("UPI")}
                      className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium ${
                        paymentMethod === "UPI"
                          ? "border-blue-600 bg-blue-50 text-blue-600"
                          : "border-slate-200 text-slate-700"
                      }`}
                    >
                      <Smartphone className="h-6 w-6" />
                      UPI
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Cash")}
                      className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium ${
                        paymentMethod === "Cash"
                          ? "border-blue-600 bg-blue-50 text-blue-600"
                          : "border-slate-200 text-slate-700"
                      }`}
                    >
                      <Banknote className="h-6 w-6" />
                      Cash
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </p>
                )}

                {/* Buttons */}
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPayment(null);
                      setPaymentMethod("");
                      setError("");
                    }}
                    className="flex-1 rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Processing..." : "Pay Now"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Payments;
