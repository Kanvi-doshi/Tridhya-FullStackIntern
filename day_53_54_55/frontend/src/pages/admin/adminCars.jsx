import { useEffect, useState } from "react";
import { Car, Plus, Search, Pencil, Trash2, X, Loader2 } from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import api from "../../service/api";

const carBrands = [
  "Audi",
  "BMW",
  "BYD",
  "Chevrolet",
  "Citroen",
  "Datsun",
  "Fiat",
  "Ford",
  "Honda",
  "Hyundai",
  "Isuzu",
  "Jaguar",
  "Jeep",
  "Kia",
  "Land Rover",
  "Lexus",
  "Mahindra",
  "Maruti Suzuki",
  "Mercedes-Benz",
  "MG",
  "Mini",
  "Mitsubishi",
  "Nissan",
  "Porsche",
  "Renault",
  "Skoda",
  "Subaru",
  "Suzuki",
  "Tata",
  "Toyota",
  "Volkswagen",
  "Volvo",
];

const AdminCars = () => {
  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const [selectedCar, setSelectedCar] = useState(null);

  const [form, setForm] = useState({
    brand: "",
    model: "",
    year: "",
    registration_number: "",
    daily_rate: "",
  });

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/cars");

      setCars(response.data.cars || []);
    } catch (error) {
      console.error("Fetch cars error:", error);

      setError(error.response?.data?.message || "Failed to load cars");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const resetForm = () => {
    setForm({
      brand: "",
      model: "",
      year: "",
      registration_number: "",
      daily_rate: "",
    });
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddCar = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await api.post("/cars", {
        brand: form.brand,
        model: form.model,
        year: Number(form.year),
        registration_number: form.registration_number,
        daily_rate: Number(form.daily_rate),
      });

      resetForm();
      setShowAddForm(false);

      await fetchCars();
    } catch (error) {
      console.error("Add car error:", error);

      alert(error.response?.data?.message || "Failed to add car");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (car) => {
    setSelectedCar(car);

    setForm({
      brand: car.brand || "",
      model: car.model || "",
      year: car.year || "",
      registration_number: car.registration_number || "",
      daily_rate: car.daily_rate || "",
    });

    setShowEditForm(true);
  };

  const handleUpdateCar = async (e) => {
    e.preventDefault();

    if (!selectedCar) return;

    try {
      setSaving(true);

      await api.put(`/cars/${selectedCar.car_id}`, {
        brand: form.brand,
        model: form.model,
        year: Number(form.year),
        registration_number: form.registration_number,
        daily_rate: Number(form.daily_rate),
      });

      resetForm();
      setSelectedCar(null);
      setShowEditForm(false);

      await fetchCars();
    } catch (error) {
      console.error("Update car error:", error);

      alert(error.response?.data?.message || "Failed to update car");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCar = async (carId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this car?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/cars/${carId}`);

      await fetchCars();
    } catch (error) {
      console.error("Delete car error:", error);

      alert(error.response?.data?.message || "Failed to delete car");
    }
  };

  const filteredCars = cars.filter((car) => {
    const value = search.toLowerCase();

    const matchesSearch =
      car.brand?.toLowerCase().includes(value) ||
      car.model?.toLowerCase().includes(value) ||
      car.registration_number?.toLowerCase().includes(value);

    const matchesStatus = statusFilter === "All" || car.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cars</h1>

              <p className="mt-1 text-gray-500">Complete vehicle management</p>
            </div>

            <button
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700"
            >
              <Plus size={18} />
              Add Car
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <div className="relative max-w-md flex-1">
              <Search
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search brand, model or registration..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Available">Available</option>
              <option value="Rented">Rented</option>
            </select>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-16">
              <Loader2 size={40} className="animate-spin text-blue-600" />
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
              <p className="text-red-600">{error}</p>

              <button
                onClick={fetchCars}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Cars */}
          {!loading && !error && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredCars.map((car) => (
                <div
                  key={car.car_id}
                  className="rounded-2xl bg-white p-5 shadow-sm"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Car size={24} />
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        car.status === "Available"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {car.status}
                    </span>
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900">
                    {car.brand} {car.model}
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Registration: {car.registration_number}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">Year: {car.year}</p>

                  <p className="mt-1 text-sm text-gray-500">
                    Daily Rate: ₹
                    {Number(car.daily_rate).toLocaleString("en-IN")}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleEditClick(car)}
                      className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 text-gray-700 hover:bg-gray-50"
                    >
                      <Pencil size={17} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteCar(car.car_id)}
                      disabled={car.status === "Rented"}
                      className="flex items-center justify-center gap-2 rounded-lg bg-red-100 px-3 py-2.5 text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 size={17} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && filteredCars.length === 0 && (
            <div className="rounded-xl bg-white p-10 text-center shadow-sm">
              <p className="text-gray-500">No cars found.</p>
            </div>
          )}
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {showEditForm ? "Edit Car" : "Add New Car"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {showEditForm
                    ? "Update vehicle details"
                    : "Enter vehicle details"}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowAddForm(false);
                  setShowEditForm(false);
                  setSelectedCar(null);
                  resetForm();
                }}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={showEditForm ? handleUpdateCar : handleAddCar}
              className="space-y-5"
            >
              {/* Brand */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Brand
                </label>

                <select
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500"
                >
                  <option value="">Select Brand</option>

                  {carBrands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Model
                </label>

                <input
                  type="text"
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                />
              </div>

              {/* Year */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Year
                </label>

                <input
                  type="number"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  required
                  min="1900"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                />
              </div>

              {/* Registration */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Registration Number
                </label>

                <input
                  type="text"
                  name="registration_number"
                  value={form.registration_number}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                />
              </div>

              {/* Daily Rate */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Daily Rate
                </label>

                <input
                  type="number"
                  name="daily_rate"
                  value={form.daily_rate}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setShowEditForm(false);
                    setSelectedCar(null);
                    resetForm();
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving && <Loader2 size={18} className="animate-spin" />}

                  {showEditForm
                    ? saving
                      ? "Updating..."
                      : "Update Car"
                    : saving
                      ? "Adding..."
                      : "Add Car"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminCars;
