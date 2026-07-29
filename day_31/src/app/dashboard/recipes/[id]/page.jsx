export default async function Recipe({ params }) {
  const { id } = await params;

  const response = await fetch(`https://dummyjson.com/recipes/${id}`);

  const recipe = await response.json();

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold mb-6">Recipe Details</h1>

      <p>
        <strong>ID:</strong> {recipe.id}
      </p>

      <p>
        <strong>Name:</strong> {recipe.name}
      </p>

      <p>
        <strong>Cuisine:</strong> {recipe.cuisine}
      </p>

      <p>
        <strong>Difficulty:</strong> {recipe.difficulty}
      </p>

      <p>
        <strong>Prep Time:</strong> {recipe.prepTimeMinutes}
      </p>

      <p>
        <strong>Cook Time:</strong> {recipe.cookTimeMinutes}
      </p>

      <p>
        <strong>Servings:</strong> {recipe.servings}
      </p>

      <p>
        <strong>Calories:</strong> {recipe.caloriesPerServing}
      </p>

      <p>
        <strong>Rating:</strong> {recipe.rating}
      </p>
    </div>
  );
}
