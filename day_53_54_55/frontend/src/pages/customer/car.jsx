import { useEffect, useState } from "react";
import { Car as CarIcon, Search, LoaderCircle } from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import CarCard from "../../components/cars/carCard";
import CarFilters from "../../components/cars/carFilter";
import Pagination from "../../components/cars/pagination";

import { getCars } from "../../service/car.service";

const Cars = () => {
  const [cars, setCars] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    totalCars: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    search: "",
    brand: "",
    status: "",
    minPrice: "",
    maxPrice: "",
    sort: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCars({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });

      setCars(response.cars);

      setPagination((previous) => ({
        ...previous,
        ...response.pagination,
      }));
    } catch (error) {
      console.error("Fetch cars error:", error);

      setError(error.response?.data?.message || "Failed to load cars.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [pagination.page, filters]);

  const handleSearch = (e) => {
    e.preventDefault();

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));
  };

  const handleReset = () => {
    setFilters({
      search: "",
      brand: "",
      status: "",
      minPrice: "",
      maxPrice: "",
      sort: "",
    });

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    setPagination((previous) => ({
      ...previous,
      page: newPage,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-blue-600">
            <CarIcon className="h-5 w-5" />

            <span className="text-sm font-medium">Car Rental</span>
          </div>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Find Your Perfect Car
          </h1>

          <p className="mt-2 text-slate-500">
            Browse our available cars and find the right one for your journey.
          </p>
        </div>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters((previous) => ({
                    ...previous,
                    search: e.target.value,
                  }))
                }
                placeholder="Search by brand, model or registration number"
                className="w-full rounded-lg border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
        </form>

        {/* Filters */}
        <div className="mb-8">
          <CarFilters
            filters={filters}
            setFilters={setFilters}
            onReset={handleReset}
          />
        </div>

        {/* Result Count */}
        {!loading && !error && (
          <div className="mb-5">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-900">{cars.length}</span>{" "}
              of{" "}
              <span className="font-medium text-slate-900">
                {pagination.totalCars}
              </span>{" "}
              cars
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex min-h-64 items-center justify-center">
            <div className="flex items-center gap-3 text-slate-500">
              <LoaderCircle className="h-6 w-6 animate-spin text-blue-600" />
              Loading cars...
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-medium text-red-600">{error}</p>

            <button
              onClick={fetchCars}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && cars.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <CarIcon className="mx-auto h-12 w-12 text-slate-300" />

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No cars found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or filters.
            </p>

            <button
              onClick={handleReset}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Cars */}
        {!loading && !error && cars.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cars.map((car) => (
                <CarCard key={car.car_id} car={car} />
              ))}
            </div>

            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Cars;
