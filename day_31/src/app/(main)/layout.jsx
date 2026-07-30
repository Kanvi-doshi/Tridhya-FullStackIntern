import Link from "next/link";

export default function DashboardLayout({ children }) {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-orange-500 text-white p-6 h-screen flex-shrink-0 ">
        <h1 className="text-3xl font-bold mb-10">RecipeVerse</h1>

        <div className="flex flex-col gap-5 text-lg">
          <Link href="/dashboard" className="hover:text-orange-200">
            Dashboard
          </Link>

          <Link href="/recipes" className="hover:text-orange-200">
            My Recipes
          </Link>

          <Link href="/profile" className="hover:text-orange-200">
            Profile
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-orange-50 p-10">{children}</div>
    </div>
  );
}
