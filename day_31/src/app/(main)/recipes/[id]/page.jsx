import BackButton from "../../components/backButton";
export default async function Recipe({ params }) {
  const { id } = await params;

  const response = await fetch(`https://dummyjson.com/recipes/${id}`);
  const recipe = await response.json();

  return (
    <div className="p-2 max-w-5xl mx-auto">
      <BackButton />
      <h1 className="text-4xl font-bold mb-8">{recipe.name}</h1>
      <div className="grid grid-cols-2 gap-6 ">
        <img
          src={recipe.image}
          alt={recipe.name}
          className="w-[400px] h-[400px] object-cover rounded-2xl shadow-lg "
        />
        <div className="grid grid-cols-2  gap-3 flex flex-col justify-center items-center ">
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="font-semibold">Cuisine</p>
            <p>{recipe.cuisine}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="font-semibold">Difficulty</p>
            <p>{recipe.difficulty}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="font-semibold">Prep Time</p>
            <p>{recipe.prepTimeMinutes} mins</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="font-semibold">Cook Time</p>
            <p>{recipe.cookTimeMinutes} mins</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="font-semibold">Servings</p>
            <p>{recipe.servings}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="font-semibold">Calories</p>
            <p>{recipe.caloriesPerServing}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="font-semibold">Rating</p>
            <p>{recipe.rating} ⭐</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="font-semibold">Meal Type</p>
            <p>{recipe.mealType?.join(", ")}</p>
          </div>
        </div>
        <div />
      </div>
      {/* Ingredients */}
      <div className="bg-white p-6 rounded-2xl shadow mb-8">
        <h2 className="text-2xl font-bold mb-4">Ingredients</h2>

        <ul className="list-disc pl-6 space-y-2">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
      </div>

      {/* Instructions */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-2xl font-bold mb-4">Instructions</h2>

        <ol className="list-decimal pl-6 space-y-3">
          {recipe.instructions.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
