  import { useState } from "react";
  import { useNavigate, useParams } from "react-router-dom";
  import { ArrowLeft, CalendarDays, Car, CreditCard } from "lucide-react";
  import { getCarById } from "../../service/car.service";
  import api from "../../service/api";

  const RentCar = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [car, setCar] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Get selected car
    useState(() => {
      const fetchCar = async () => {
        try {
          const response = await getCarById(id);
          setCar(response.car);
        } catch (error) {
          console.error("Failed to fetch car:", error);
          setError("Unable to load car details.");
        } finally {
          setLoading(false);
        }
      };

      fetchCar();
    }, []);

    const calculateDays = () => {
      if (!startDate || !endDate) return 0;

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) return 0;

      return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    };

    const numberOfDays = calculateDays();

    const totalAmount = car ? Number(car.daily_rate) * numberOfDays : 0;

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");

      if (!startDate || !endDate) {
        setError("Please select both start and end dates.");
        return;
      }

      if (numberOfDays <= 0) {
        setError("End date must be after start date.");
        return;
      }

      try {
        setSubmitting(true);

        const response = await api.post("/rentals", {
          car_id: Number(id),
          start_date: startDate,
          end_date: endDate,
        });

        // Rental created successfully
        const rentalId = response.data.rental.rental_id;

        // Go to payment page
       navigate("/payments", {
         state: {
           rentalId,
         },
       });
      } catch (error) {
        console.error("Rental creation error:", error);

        setError(error.response?.data?.message || "Failed to create rental.");
      } finally {
        setSubmitting(false);
      }
    };

    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-slate-500">Loading car...</p>
        </div>
      );
    }

    if (!car) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-red-500">Car not found.</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-100">
        <div className="mx-auto max-w-4xl px-6 py-8">
          {/* Back */}
          <button
            onClick={() => navigate("/cars")}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cars
          </button>

          {/* Header */}
          <div className="mb-6">
            <p className="text-sm font-medium text-blue-600">Rent a Car</p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Book Your Car
            </h1>

            <p className="mt-2 text-slate-500">
              Select your rental dates and confirm your booking.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Car Details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
                <Car className="h-7 w-7 text-blue-600" />
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                {car.brand} {car.model}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Registration: {car.registration_number}
              </p>

              <p className="mt-1 text-sm text-slate-500">Year: {car.year}</p>

              <div className="mt-6 border-t border-slate-200 pt-5">
                <p className="text-sm text-slate-500">Daily Rate</p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  ₹{Number(car.daily_rate).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Rental Form */}
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-slate-900">
                Rental Details
              </h2>

              {/* Start Date */}
              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Start Date
                </label>

                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-lg border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  End Date
                </label>

                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split("T")[0]}
                    className="w-full rounded-lg border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Rental Days</span>

                  <span className="font-medium text-slate-900">
                    {numberOfDays}
                  </span>
                </div>

                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-slate-500">Daily Rate</span>

                  <span className="font-medium text-slate-900">
                    ₹{Number(car.daily_rate).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="mt-4 border-t border-slate-200 pt-4">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-900">Total</span>

                    <span className="text-xl font-bold text-blue-600">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CreditCard className="h-5 w-5" />

                {submitting ? "Creating Rental..." : "Continue to Payment"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  export default RentCar;
