export default function Favorites() {
  const favorites = ["Margherita Pizza", "White Sauce Pasta", "Chocolate Cake"];

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Favorite Recipes</h1>

      <div className="space-y-4">
        {favorites.map((item, index) => (
          <div key={index} className="bg-white p-5 rounded-xl shadow">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
