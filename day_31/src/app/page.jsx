import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold text-orange-600 mb-4">RecipeVerse</h1>

      <p className="text-gray-600 mb-10">
        Discover and explore delicious recipes.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/recipes"
          className="bg-orange-500 text-white px-6 py-3 rounded-lg text-center hover:bg-orange-600"
        >
          Recipes
        </Link>

        <Link
          href="/categories"
          className="bg-orange-500 text-white px-6 py-3 rounded-lg text-center hover:bg-orange-600"
        >
          Categories
        </Link>

        <Link
          href="/search?query=pizza"
          className="bg-orange-500 text-white px-6 py-3 rounded-lg text-center hover:bg-orange-600"
        >
          Search
        </Link>

        <Link
          href="/login"
          className="bg-orange-500 text-white px-6 py-3 rounded-lg text-center hover:bg-orange-600"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
