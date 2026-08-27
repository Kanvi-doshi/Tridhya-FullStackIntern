import { Filter, RotateCcw } from "lucide-react";

const CarFilters = ({ filters, setFilters, onReset }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-600" />

          <h2 className="font-semibold text-slate-900">Filters</h2>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1 text-sm text-slate-500 transition hover:text-blue-600"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Brand */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Brand
          </label>

          <input
            type="text"
            name="brand"
            value={filters.brand}
            onChange={handleChange}
            placeholder="e.g. Toyota"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Status */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Status
          </label>

          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All</option>
            <option value="Available">Available</option>
            <option value="Rented">Rented</option>
          </select>
        </div>

        {/* Min Price */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Min Price
          </label>

          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleChange}
            placeholder="₹0"
            min="0"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Max Price */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Max Price
          </label>

          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleChange}
            placeholder="₹5000"
            min="0"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Sort */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Sort By
          </label>

          <select
            name="sort"
            value={filters.sort}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="brand_asc">Brand: A-Z</option>
            <option value="brand_desc">Brand: Z-A</option>
            <option value="year_asc">Year: Oldest</option>
            <option value="year_desc">Year: Newest</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default CarFilters;
