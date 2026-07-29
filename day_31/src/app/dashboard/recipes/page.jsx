import Link from "next/link";

export default async function ServerRecipes() {
  const response = await fetch("https://dummyjson.com/recipes");

  const data = await response.json();

  return (
    <div className="min-h-screen p-10 bg-orange-50">
      <h1 className="text-4xl font-bold mb-8">Server Rendered Recipes</h1>

      <div className="grid grid-cols-3 gap-5">
        {data.recipes.slice(0, 6).map((recipe) => (
          <Link
            key={recipe.id}
            href={`/dashboard/recipes/${recipe.id}`}
            className="bg-white p-5 rounded-xl shadow hover:shadow-xl"
          >
            <h2 className="text-xl font-semibold">{recipe.name}</h2>

            <p className="mt-2">Cuisine: {recipe.cuisine}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
