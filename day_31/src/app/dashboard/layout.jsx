import Link from "next/link";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-orange-500 text-white p-6">
        <h1 className="text-3xl font-bold mb-10">RecipeVerse</h1>

        <div className="flex flex-col gap-5 text-lg">
          <Link href="/dashboard" className="hover:text-orange-200">
            Dashboard
          </Link>

          <Link href="/dashboard/profile" className="hover:text-orange-200">
            Profile
          </Link>

          <Link href="/dashboard/favorites" className="hover:text-orange-200">
            Favorites
          </Link>

          <Link href="/dashboard/recipes" className="hover:text-orange-200">
            My Recipes
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-orange-50 p-10">{children}</div>
    </div>
  );
}
