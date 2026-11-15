import { Car, CalendarDays, Fuel, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CarCard = ({ car }) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      {/* Car Image Placeholder */}
      <div className="flex h-48 items-center justify-center bg-slate-100">
        <Car className="h-20 w-20 text-slate-300" />
      </div>

      <div className="p-5">
        {/* Status */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {car.brand}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              car.status === "Available"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {car.status}
          </span>
        </div>

        {/* Name */}
        <h3 className="text-xl font-semibold text-slate-900">
          {car.brand} {car.model}
        </h3>

        {/* Details */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {car.year}
          </div>

          <div className="flex items-center gap-2">
            <Fuel className="h-4 w-4" />
            {car.color || "N/A"}
          </div>
        </div>

        {/* Price */}
        <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs text-slate-500">Daily rate</p>

            <p className="text-lg font-bold text-slate-900">
              ₹{Number(car.daily_rate).toLocaleString("en-IN")}
              <span className="text-sm font-normal text-slate-500">/day</span>
            </p>
          </div>

          <button
            onClick={() => navigate(`/cars/${car.car_id}`)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            View
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
