import DashboardCard from "../components/dashboardCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const response = await fetch("https://dummyjson.com/recipes?limit=6", {
    cache:"no-store",
  });

  const data = await response.json();

  const categories = [...new Set(data.recipes.map((recipe) => recipe.cuisine))];

  return (
    <div className="space-y-10  max-h-[700px]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400  rounded-3xl p-8 flex items-center justify-between text-white shadow-lg">
        <div>
          <h1 className="text-5xl font-bold  animate-fadeInUp ">
            Discover Amazing Recipes
          </h1>
          <p className="mt-4 text-lg animate-fadeInUpDelay">
            Explore hundreds of delicious recipes from around the world.
          </p>
        </div>

        <img
          src="https://cdn-icons-png.flaticon.com/512/5787/5787016.png"
          alt="Chef"
          className="w-60"
        />
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <DashboardCard title="Recipes" value="50+" />

        <DashboardCard title="Favorites" value="12" />

        <DashboardCard title="Categories" value="15" />

        <DashboardCard title="Avg Rating" value="4.8 ⭐" />
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-3xl font-bold mb-5">Categories</h2>

        <div className="flex flex-wrap gap-4">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/dashboard/categories/${category}`}
              className="bg-white px-6 py-3 rounded-xl shadow-lg hover:bg-orange-500 hover:text-white transition"
            >
              {category}
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Recipes */}
      <div>
        <h2 className="text-3xl font-bold mb-5">Featured Recipes</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.recipes.map((recipe) => (
            <Link key={recipe.id} href={`/dashboard/recipes/${recipe.id}`}>
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition duration-300 cursor-pointer">
                <img
                  src={recipe.image}
                  alt={recipe.name}
                  className="w-full max-w-xs h-auto"
                />

                <div className="p-5">
                  <h2 className="text-xl font-bold line-clamp-1">
                    {recipe.name}
                  </h2>

                  <p className="text-gray-500 mt-2">{recipe.cuisine}</p>

                  <div className="flex justify-between mt-4 text-sm text-gray-600">
                    <span>⭐ {recipe.rating}</span>

                    <span>
                      {recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
