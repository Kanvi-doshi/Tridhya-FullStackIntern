import Link from "next/link";

export default async function ServerRecipes() {
  const response = await fetch("https://dummyjson.com/recipes", {
    next:{revalidate:20},
  });
  const generatedAt = new Date().toLocaleString();
  const data = await response.json();

  return (
    <div className="min-h-screen p-2 bg-orange-50 ">
      <h1 className="text-4xl font-bold mb-8">My Recipes</h1>
      <p className="text-gray-500">Generated At: {generatedAt}</p>

      <div className="grid grid-cols-3 gap-5">
        {data.recipes.slice(0, 15).map((recipe) => (
          <Link
            key={recipe.id}
            href={`/recipes/${recipe.id}`}
            className="bg-white p-5 rounded-xl shadow hover:shadow-xl"
          >
            <img
              src={recipe.image}
              alt={recipe.name}
              className="w-full h-52 object-cover"
            />
            <h2 className="text-xl font-semibold">{recipe.name}</h2>

            <p className="mt-2">Cuisine: {recipe.cuisine}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
