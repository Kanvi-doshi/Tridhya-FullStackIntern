import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Car, CalendarDays } from "lucide-react";
import { getCarById } from "../../service/car.service";

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Loading car details...</p>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">{error || "Car not found"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Back */}
        <button
          onClick={() => navigate("/cars")}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cars
        </button>

        {/* Car Details */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <div className="bg-blue-600 p-8 text-white">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20">
              <Car className="h-8 w-8" />
            </div>

            <h1 className="mt-5 text-3xl font-bold">
              {car.brand} {car.model}
            </h1>

            <p className="mt-2 text-blue-100">
              {car.year} • {car.registration_number}
            </p>
          </div>

          <div className="p-8">
            {/* Details */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-sm text-slate-500">Brand</p>
                <p className="mt-1 font-semibold text-slate-900">{car.brand}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Model</p>
                <p className="mt-1 font-semibold text-slate-900">{car.model}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Year</p>
                <p className="mt-1 font-semibold text-slate-900">{car.year}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Registration Number</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {car.registration_number}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Color</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {car.color || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Status</p>
                <span
                  className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                    car.status === "Available"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {car.status}
                </span>
              </div>
            </div>

            {/* Price + Rent */}
            <div className="mt-8 flex flex-col gap-5 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">Daily Rental Rate</p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  ₹{Number(car.daily_rate).toLocaleString("en-IN")}
                </p>
              </div>

              <button
                disabled={car.status !== "Available"}
                onClick={() => navigate(`/cars/${car.car_id}/rent`)}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <CalendarDays className="h-5 w-5" />

                {car.status === "Available"
                  ? "Rent This Car"
                  : "Car Not Available"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CarDetails;
