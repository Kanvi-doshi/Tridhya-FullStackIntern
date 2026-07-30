import Link from "next/link";
import BackButton from "../../components/backButton";
export default async function CategoryPage({ params }) {
  const response = await fetch("https://dummyjson.com/recipes");
  const data = await response.json();
  const { category } = await params;
  const filteredRecipes = data.recipes.filter(
    (recipe) => recipe.cuisine === decodeURIComponent(category),
  );

  return (
    <div>
      <BackButton/>
      <h1 className="text-4xl font-bold mb-8">{category} Recipes</h1>

      <div className="grid grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
            <div className="bg-white rounded-xl shadow-lg p-5 cursor-pointer hover:shadow-2xl hover:scale-105 transition duration-300">
              <img
                src={recipe.image}
                alt={recipe.name}
                className="h-[400px] w-[400px] object-cover rounded-lg"
              />

              <h2 className="text-xl font-bold mt-4">{recipe.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
