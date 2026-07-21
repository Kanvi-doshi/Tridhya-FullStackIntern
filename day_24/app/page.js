import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">Student CRUD App</h1>

      <Link
        href="/students"
        className="bg-blue-500 text-white px-6 py-3 rounded-lg"
      >
        Manage Students
      </Link>
    </div>
  );
}
