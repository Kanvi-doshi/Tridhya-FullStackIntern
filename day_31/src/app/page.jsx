import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-orange-100">
      <h1 className="text-5xl font-bold text-orange-600 mb-4">RecipeVerse</h1>

      <p className="text-gray-600 mb-10">
        Discover and explore delicious recipes.
      </p>

      <Link href="/dashboard">
        <button className="mt-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Go to Dashboard
        </button>
      </Link>
    </div>
  );
}
